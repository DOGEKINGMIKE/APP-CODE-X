import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, AlertCircle, Plus, Calendar, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIFileAction {
  name: string;
  content: string;
  action: 'create' | 'update';
}

interface CalendarEvent {
  title: string;
  date: string;
  type: 'schedule' | 'day-off' | 'deadline';
  time?: string;
}

interface NoteAction {
  title: string;
  content: string;
}

interface AIChatProps {
  files: FileItem[];
  onFilesGenerated: (files: AIFileAction[]) => void;
  onCalendarEvent?: (event: CalendarEvent) => void;
  onNoteCreate?: (note: NoteAction) => void;
  envVars?: { key: string; value: string }[];
  userId?: string;
}

const CHAT_URL = '/api/chat';

const AIChat: React.FC<AIChatProps> = ({ files, onFilesGenerated, onCalendarEvent, onNoteCreate, envVars, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const parseAndApplyActions = (content: string) => {
    // Parse file generation blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.files && Array.isArray(parsed.files)) {
          onFilesGenerated(parsed.files);
        }
        if (parsed.calendarEvents && Array.isArray(parsed.calendarEvents) && onCalendarEvent) {
          for (const ev of parsed.calendarEvents) {
            onCalendarEvent(ev);
          }
        }
        if (parsed.notes && Array.isArray(parsed.notes) && onNoteCreate) {
          for (const note of parsed.notes) {
            onNoteCreate(note);
          }
        }
      } catch { /* not valid json */ }
    }

    // Parse inline calendar commands like "CALENDAR: ..."
    const calendarMatch = content.match(/CALENDAR:\s*(.+?)(?:\n|$)/i);
    if (calendarMatch && onCalendarEvent) {
      const parts = calendarMatch[1].split('|').map(s => s.trim());
      if (parts.length >= 2) {
        onCalendarEvent({
          title: parts[0],
          date: parts[1] || new Date().toISOString().split('T')[0],
          type: (parts[2] as CalendarEvent['type']) || 'schedule',
          time: parts[3],
        });
      }
    }

    // Parse inline note commands like "NOTE: ..."
    const noteMatch = content.match(/NOTE:\s*(.+?)(?:\n|$)/i);
    if (noteMatch && onNoteCreate) {
      onNoteCreate({
        title: noteMatch[1].split('|')[0]?.trim() || 'AI Note',
        content: noteMatch[1].split('|')[1]?.trim() || noteMatch[1].trim(),
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    let assistantContent = '';

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const fileContext = files
        .filter(f => f.type === 'file' && f.content)
        .map(f => `--- ${f.name} ---\n${f.content}`)
        .join('\n\n');

      const envContext = envVars && envVars.length > 0
        ? `\n\nAvailable environment variables:\n${envVars.map(e => `${e.key}=${e.value.slice(0, 4)}****`).join('\n')}`
        : '';

      const systemMessage = `You are X-11, a professional AI coding assistant for "Code Studio X-11" cloud IDE.
You help users build COMPLETE web applications with HTML, CSS, and JavaScript.

CAPABILITIES:
1. Generate complete websites and apps with multiple files
2. Create notes: Include "notes" array in JSON with {title, content} objects
3. Create calendar events: Include "calendarEvents" array in JSON with {title, date, type, time} objects where type is "schedule"|"day-off"|"deadline"
4. Use env vars in generated code when the user has them configured

When generating code, always respond with a JSON block like this:
\`\`\`json
{
  "files": [{"name": "index.html", "content": "...", "action": "create"}],
  "notes": [{"title": "...", "content": "..."}],
  "calendarEvents": [{"title": "...", "date": "2026-02-24", "type": "schedule", "time": "14:00"}]
}
\`\`\`

ALWAYS generate professional, responsive, modern code. Include proper meta tags, semantic HTML, accessibility attributes, and mobile-responsive CSS. Make designs look polished and production-ready.

Current project files:
${fileContext || '(no files yet)'}${envContext}`;

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemMessage },
            ...allMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!resp.ok) {
        const errorMap: Record<number, string> = {
          429: 'Too many requests. Please wait a moment.',
          401: 'Authentication required.',
          500: 'Service temporarily unavailable.',
          503: 'Service temporarily unavailable.',
        };
        setError(errorMap[resp.status] || 'An error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        setError('No response body');
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        upsertAssistant(chunk);
      }

      parseAndApplyActions(assistantContent);

    } catch (e) {
      console.error('Chat error:', e);
      setError('Connection failed. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Build a full website', prompt: 'Build a complete professional portfolio website with hero, about, projects, and contact sections. Make it responsive and modern.' },
    { label: 'E-commerce page', prompt: 'Create a professional e-commerce product page with image gallery, add to cart, reviews section, and responsive design.' },
    { label: 'Dashboard app', prompt: 'Build a modern admin dashboard with sidebar navigation, stats cards, charts area, and a data table. Dark theme.' },
    { label: 'Create a note', prompt: 'Create a note titled "Project Ideas" with content listing 5 web app ideas I should build.' },
    { label: 'Schedule deadline', prompt: 'Add a calendar event for a project deadline next week.' },
  ];

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">X-11 AI Assistant</span>
        {onCalendarEvent && <span title="Can create calendar events"><Calendar className="w-3 h-3 text-muted-foreground ml-auto" /></span>}
        {onNoteCreate && <span title="Can create notes"><StickyNote className="w-3 h-3 text-muted-foreground" /></span>}
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium ml-1">LIVE</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 gap-3 flex flex-col">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Bot className="w-10 h-10 mx-auto mb-3 text-primary opacity-60" />
            <p className="text-sm text-muted-foreground mb-1">Hi! I'm X-11, your AI coding assistant.</p>
            <p className="text-xs text-muted-foreground mb-4">I can build websites, create notes, and schedule events.</p>
            <div className="flex flex-col gap-1.5">
              {quickActions.map(s => (
                <button key={s.label} onClick={() => setInput(s.prompt)} className="text-left text-xs px-3 py-2 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-xs [&_code]:text-primary [&_p]:my-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border shrink-0">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Build a website, create notes, schedule events..."
            className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[36px]"
            disabled={isLoading}
          />
          <Button size="sm" onClick={sendMessage} disabled={isLoading || !input.trim()} className="h-9 w-9 p-0 shrink-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
