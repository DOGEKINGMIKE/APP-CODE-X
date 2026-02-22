import React, { useState, useEffect } from 'react';
import { Code2, Plus, Trash2, Copy, Check, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: number;
}

const STORAGE_KEY = 'csx11-snippets';

const LANGUAGES = ['javascript', 'typescript', 'html', 'css', 'python', 'json', 'sql', 'shell', 'markdown', 'other'];

interface SnippetsPanelProps {
  userId?: string;
}

const SnippetsPanel: React.FC<SnippetsPanelProps> = ({ userId }) => {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState('javascript');
  const [newCode, setNewCode] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  }, [snippets]);

  const createSnippet = () => {
    if (!newTitle.trim() || !newCode.trim()) return;
    const snippet: Snippet = {
      id: `snip_${Date.now()}`,
      title: newTitle.trim(),
      language: newLang,
      code: newCode,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: Date.now(),
    };
    setSnippets(prev => [snippet, ...prev]);
    setIsCreating(false);
    setNewTitle(''); setNewCode(''); setNewTags('');
  };

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const copySnippet = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = snippets.filter(s =>
    !filterText ||
    s.title.toLowerCase().includes(filterText.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(filterText.toLowerCase())) ||
    s.language.toLowerCase().includes(filterText.toLowerCase())
  );

  if (isCreating) {
    return (
      <div className="h-full flex flex-col bg-explorer-background">
        <div className="h-9 bg-card border-b border-border flex items-center justify-between px-3 shrink-0">
          <span className="text-xs font-medium text-foreground">New Snippet</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button size="sm" className="h-6 text-xs px-2" onClick={createSnippet} disabled={!newTitle.trim() || !newCode.trim()}>Save</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Snippet title..." className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none" autoFocus />
          <select value={newLang} onChange={e => setNewLang(e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Tags (comma separated)..." className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none" />
          <textarea value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Paste your code here..." className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none min-h-[200px] resize-none leading-relaxed" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-explorer-background">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Snippets</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{snippets.length}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
          <Search className="w-3 h-3 text-muted-foreground shrink-0" />
          <input value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Search snippets..." className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Code2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs mb-1">No snippets</p>
            <p className="text-[10px] opacity-60">Save reusable code here</p>
          </div>
        ) : (
          filtered.map(snippet => (
            <div key={snippet.id} className="p-2.5 rounded-md border border-border hover:border-primary/30 transition-all bg-card/50">
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-medium text-foreground truncate flex-1">{snippet.title}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copySnippet(snippet)}>
                    {copiedId === snippet.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteSnippet(snippet.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-medium">{snippet.language}</span>
                {snippet.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                    <Tag className="w-2 h-2" />{tag}
                  </span>
                ))}
              </div>
              <pre className="text-[10px] text-muted-foreground font-mono bg-editor-background rounded p-2 overflow-x-auto max-h-[80px] leading-relaxed">
                {snippet.code}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SnippetsPanel;
