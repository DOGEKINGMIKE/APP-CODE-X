import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, Plus, Trash2, Pin, PinOff, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  color: string;
  createdAt: number;
  updatedAt: number;
}

const NOTE_COLORS = [
  'hsl(var(--primary) / 0.15)',
  'hsl(50 95% 55% / 0.15)',
  'hsl(135 60% 50% / 0.15)',
  'hsl(340 80% 55% / 0.15)',
  'hsl(200 85% 55% / 0.15)',
  'hsl(25 90% 55% / 0.15)',
];

const STORAGE_KEY = 'csx11-notes';

interface NotesPanelProps {
  userId?: string;
  externalNotes?: { title: string; content: string }[];
}

const NotesPanel: React.FC<NotesPanelProps> = ({ userId, externalNotes }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveLocal = (nts: Note[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nts)); } catch {}
  };

  // Load notes
  useEffect(() => {
    const loadLocal = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        setNotes(stored);
      } catch { setNotes([]); }
    };

    if (!userId || !isSupabaseConfigured) {
      loadLocal();
      return;
    }

    const loadNotes = async () => {
      const { data } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .not('title', 'like', 'CAL:%')
        .order('updated_at', { ascending: false });
      if (data && data.length > 0) {
        setNotes(data.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content || '',
          pinned: n.pinned || false,
          color: n.color || NOTE_COLORS[0],
          createdAt: new Date(n.created_at).getTime(),
          updatedAt: new Date(n.updated_at).getTime(),
        })));
      } else {
        loadLocal();
      }
    };
    loadNotes();
  }, [userId]);

  // Handle external notes from AI
  useEffect(() => {
    if (externalNotes && externalNotes.length > 0) {
      const newNotes: Note[] = externalNotes.map(en => ({
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: en.title,
        content: en.content,
        pinned: false,
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      setNotes(prev => {
        const merged = [...newNotes, ...prev];
        saveLocal(merged);
        return merged;
      });
    }
  }, [externalNotes]);

  const createNote = async () => {
    const color = NOTE_COLORS[notes.length % NOTE_COLORS.length];
    const now = Date.now();
    const note: Note = {
      id: `note_${now}`,
      title: 'Untitled Note',
      content: '',
      pinned: false,
      color,
      createdAt: now,
      updatedAt: now,
    };

    if (userId && isSupabaseConfigured) {
      const { data } = await supabase.from('user_notes').insert({
        user_id: userId,
        title: 'Untitled Note',
        content: '',
        pinned: false,
        color,
      }).select().single();
      if (data) {
        note.id = data.id;
        note.createdAt = new Date(data.created_at).getTime();
        note.updatedAt = new Date(data.updated_at).getTime();
      }
    }

    const updated = [note, ...notes];
    setNotes(updated);
    saveLocal(updated);
    setActiveNoteId(note.id);
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n);
    setNotes(updated);
    saveLocal(updated);

    if (userId && isSupabaseConfigured) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.pinned !== undefined) dbUpdates.pinned = updates.pinned;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('user_notes').update(dbUpdates).eq('id', id);
      }
    }
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveLocal(updated);
    if (activeNoteId === id) setActiveNoteId(null);
    if (userId && isSupabaseConfigured) {
      await supabase.from('user_notes').delete().eq('id', id);
    }
  };

  const togglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) updateNote(id, { pinned: !note.pinned });
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  const sortedNotes = [...notes]
    .filter(n => !filterText || n.title.toLowerCase().includes(filterText.toLowerCase()) || n.content.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (activeNote) {
    return (
      <div className="h-full flex flex-col bg-explorer-background">
        <div className="h-9 bg-card border-b border-border flex items-center justify-between px-3 shrink-0">
          <button onClick={() => setActiveNoteId(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-3 h-3 rotate-180" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => togglePin(activeNote.id)}>
              {activeNote.pinned ? <PinOff className="w-3 h-3 text-primary" /> : <Pin className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteNote(activeNote.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="px-3 py-2 border-b border-border">
          <input
            value={activeNote.title}
            onChange={e => updateNote(activeNote.id, { title: e.target.value })}
            className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
            placeholder="Note title..."
          />
          <span className="text-[10px] text-muted-foreground">{formatDate(activeNote.updatedAt)}</span>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <textarea
            ref={textareaRef}
            value={activeNote.content}
            onChange={e => updateNote(activeNote.id, { content: e.target.value })}
            className="flex-1 bg-transparent text-xs text-foreground font-mono p-3 resize-none focus:outline-none leading-relaxed"
            placeholder="Write your note here... (supports Markdown)"
          />
        </div>
        {activeNote.content && (
          <div className="border-t border-border max-h-[40%] overflow-y-auto p-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1 block">Preview</span>
            <div className="prose prose-sm prose-invert max-w-none text-xs [&_p]:my-1 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_pre]:bg-background/50 [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-[10px] [&_code]:text-primary [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
              <ReactMarkdown>{activeNote.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-explorer-background">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{notes.length}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" onClick={() => setShowFilter(v => !v)} className={`h-6 w-6 p-0 ${showFilter ? 'text-primary' : 'text-muted-foreground'}`}>
              <Search className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={createNote} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {showFilter && (
          <input
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
            autoFocus
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs mb-1">No notes yet</p>
            <p className="text-[10px] opacity-60">Click + to create one</p>
          </div>
        ) : (
          sortedNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className="w-full text-left p-2.5 rounded-md border border-border hover:border-primary/30 transition-all group"
              style={{ background: note.color }}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-medium text-foreground truncate flex-1">{note.title}</span>
                {note.pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
              </div>
              {note.content && (
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{note.content}</p>
              )}
              <span className="text-[9px] text-muted-foreground/60 mt-1 block">{formatDate(note.updatedAt)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
