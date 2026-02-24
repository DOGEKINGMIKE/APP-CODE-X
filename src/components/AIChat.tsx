import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';

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

interface AIChatProps {
  files: FileItem[];
  onFilesGenerated: (files: AIFileAction[]) => void;
  userId?: string;
}

// Use the API route for AI chat (works on Vercel)
const CHAT_URL = '/api/chat';

const AIChat: React.FC<AIChatProps> = ({ files, onFilesGenerated, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const parseAndApplyFiles = async (content: string) => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.files && Array.isArray(parsed.files)) {
          onFilesGenerated(parsed.files);
        }
        // Handle AI-created notes
        if (parsed.notes && Array.isArray(parsed.notes) && userId) {
          for (const note of parsed.notes) {
            await supabase.from('user_notes').insert({
              user_id: userId,
              title: note.title || 'AI Note',
              content: note.content || '',
            });
          }
        }
      } catch { /* not valid json */ }
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
      // Build system context with the user's current files
      const fileContext = files
        .filter(f => f.type === 'file' && f.content)
        .map(f => `--- ${f.name} ---\n${f.content}`)
        .join('\n\n');

      const systemMessage = `You are X-11, a professional AI coding assistant for a cloud IDE called "Code Studio X-11".
You help users build web apps with HTML, CSS, and JavaScript.
When generating code, respond with a JSON block containing a "files" array with objects having "name", "content", and "action" ("create" or "update") fields.

Current project files:
${fileContext || '(no files yet)'}`;

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

      // Stream the response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        upsertAssistant(chunk);
      }

      await parseAndApplyFiles(assistantContent);

    } catch (e) {
      console.error('Chat error:', e);
      setError('Connection failed. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">X-11 AI Assistant</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">LIVE</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-primary opacity-60" />
            <p className="text-sm text-muted-foreground mb-1">Hi! I'm X-11, your AI coding assistant.</p>
            <p className="text-xs text-muted-foreground">Ask me to build apps, generate code, create notes, or fix bugs.</p>
            <div className="mt-4 space-y-2">
              {['Build a todo app with HTML, CSS & JS', 'Create a landing page', 'Create a note about my project ideas'].map(s => (
                <button key={s} onClick={() => setInput(s)} className="block w-full text-left text-xs px-3 py-2 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors">
                  {s}
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
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Ask X-11 to build something..." className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" disabled={isLoading} />
          <Button size="sm" onClick={sendMessage} disabled={isLoading || !input.trim()} className="h-8 w-8 p-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
