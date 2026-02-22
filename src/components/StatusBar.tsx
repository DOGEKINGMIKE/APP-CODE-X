import React from 'react';
import { GitBranch, Zap, Palette, CheckCircle2 } from 'lucide-react';

interface StatusBarProps {
  currentFile?: { name: string; language?: string };
  fileCount: number;
  isPreviewMode: boolean;
  themeName?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentFile, fileCount, isPreviewMode, themeName }) => {
  return (
    <div className="h-6 bg-status-background border-t border-border flex items-center justify-between px-2 text-[11px] shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-status-foreground">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1.5 text-status-foreground">
          <CheckCircle2 className="w-3 h-3" />
          <span>0 problems</span>
        </div>
        {isPreviewMode && (
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-3 h-3" />
            <span>Live</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {currentFile && <span className="text-status-foreground">{currentFile.language || 'plaintext'}</span>}
        {themeName && (
          <div className="flex items-center gap-1 text-status-foreground">
            <Palette className="w-3 h-3" />
            <span>{themeName}</span>
          </div>
        )}
        <span className="text-status-foreground">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
        <span className="text-status-foreground">UTF-8</span>
      </div>
    </div>
  );
};

export default StatusBar;
