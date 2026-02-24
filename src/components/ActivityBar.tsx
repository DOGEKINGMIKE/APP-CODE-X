import React from 'react';
import {
  Files, Search, GitBranch, Blocks, Bot, Sparkles, Settings, Terminal,
  Eye, Code2, StickyNote, Globe, Scissors, CalendarDays, Server, Earth,
  KeyRound, BarChart3,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type ActivityView = 'explorer' | 'search' | 'git' | 'nocode' | 'ai' | 'nova' | 'settings' | 'notes' | 'browser' | 'snippets' | 'calendar' | 'servers' | 'domains' | 'env' | 'analytics';

interface ActivityBarProps {
  activeView: ActivityView | null;
  onViewChange: (view: ActivityView) => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

const topItems: { id: ActivityView; icon: React.ElementType; label: string }[] = [
  { id: 'explorer', icon: Files, label: 'Explorer (Ctrl+B)' },
  { id: 'search', icon: Search, label: 'Search (Ctrl+F)' },
  { id: 'notes', icon: StickyNote, label: 'Notes' },
  { id: 'snippets', icon: Scissors, label: 'Snippets' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'nocode', icon: Blocks, label: 'No-Code Builder' },
  { id: 'ai', icon: Bot, label: 'AI Chat' },
  { id: 'nova', icon: Sparkles, label: 'NOVA AI' },
  { id: 'browser', icon: Globe, label: 'Browser' },
  { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { id: 'servers', icon: Server, label: 'Servers' },
  { id: 'domains', icon: Earth, label: 'Domains' },
  { id: 'env', icon: KeyRound, label: 'Environment Variables' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
];

const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView, onViewChange, showTerminal, onToggleTerminal, showPreview, onTogglePreview,
}) => {
  return (
    <div className="w-12 bg-status-background border-r border-border flex flex-col items-center py-2 shrink-0">
      <div className="mb-3 flex items-center justify-center">
        <Code2 className="w-5 h-5 text-primary" />
      </div>

      <div className="flex flex-col items-center gap-0.5 flex-1">
        {topItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeView === id;
          return (
            <Tooltip key={id} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewChange(id)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                    isActive ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                  )}
                  <Icon className="w-[18px] h-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-0.5 mt-auto">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button onClick={onTogglePreview} className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${showPreview ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'}`}>
              <Eye className="w-[18px] h-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Preview</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button onClick={onToggleTerminal} className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${showTerminal ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'}`}>
              <Terminal className="w-[18px] h-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{'Terminal (Ctrl+`)'}</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button onClick={() => onViewChange('settings')} className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${activeView === 'settings' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'}`}>
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Settings (Ctrl+,)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ActivityBar;
