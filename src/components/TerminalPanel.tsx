import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info' | 'system';
  message: string;
  timestamp: Date;
}

interface TerminalPanelProps {
  logs: LogEntry[];
  onClear: () => void;
  onCommand?: (cmd: string) => void;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ logs, onClear, onCommand }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [logs]);

  const handleCommand = () => {
    if (!input.trim()) return;
    setHistory(prev => [input.trim(), ...prev].slice(0, 50));
    setHistoryIndex(-1);
    onCommand?.(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleCommand(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) { const i = Math.min(historyIndex + 1, history.length - 1); setHistoryIndex(i); setInput(history[i]); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) { const i = historyIndex - 1; setHistoryIndex(i); setInput(history[i]); } else { setHistoryIndex(-1); setInput(''); }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); onClear(); }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'system': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  const getLogPrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return '[ERR]';
      case 'warn': return '[WRN]';
      case 'info': return '[INF]';
      case 'system': return '[SYS]';
      default: return '  $  ';
    }
  };

  return (
    <div className="h-full flex flex-col bg-editor-background" onClick={() => inputRef.current?.focus()}>
      <div className="h-9 bg-card border-b border-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Terminal</span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{logs.length}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-6 w-6 p-0 hover:bg-muted text-muted-foreground hover:text-foreground">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-5">
        {logs.length === 0 && (
          <div className="text-muted-foreground py-4 text-center">
            <p>Terminal ready. Type <span className="text-primary">help</span> for available commands.</p>
          </div>
        )}
        {logs.map(log => (
          <div key={log.id} className={`flex gap-2 ${getLogColor(log.type)} hover:bg-muted/30 px-1 rounded`}>
            <span className="opacity-30 shrink-0 select-none">
              {log.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="shrink-0 opacity-50 font-semibold select-none">{getLogPrefix(log.type)}</span>
            <span className="break-all whitespace-pre-wrap">{log.message}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-1.5 shrink-0">
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-primary font-mono font-bold select-none">$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a command... (up/down for history)" className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
        </div>
      </div>
    </div>
  );
};

export default TerminalPanel;
