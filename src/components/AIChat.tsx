import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

const AIChat: React.FC<AIChatProps> = ({ files, onFilesGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const parseAIResponse = (content: string) => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.files && Array.isArray(parsed.files)) {
          onFilesGenerated(parsed.files);
          return parsed.message || 'Files generated successfully!';
        }
      } catch { /* not valid json */ }
    }
    return content;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (no backend connected)
    setTimeout(() => {
      const response = `I'd be happy to help you with that! Here's what I suggest:\n\nSince this is a local coding environment, I can help you plan and structure your code. Try creating files using the file explorer and I'll assist with coding patterns, debugging, and best practices.\n\nSome things I can help with:\n• Code structure & architecture\n• Debugging tips\n• Best practices\n• Template generation`;
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">X-11 AI Assistant</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-primary opacity-60" />
            <p className="text-sm text-muted-foreground mb-1">Hi! I'm X-11, your AI coding assistant.</p>
            <p className="text-xs text-muted-foreground">Ask me to build apps, generate code, or fix bugs.</p>
            <div className="mt-4 space-y-2">
              {['Build a todo app with HTML, CSS & JS', 'Create a landing page', 'Build a calculator app'].map(s => (
                <button key={s} onClick={() => setInput(s)} className="block w-full text-left text-xs px-3 py-2 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}>
              {msg.content}
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
