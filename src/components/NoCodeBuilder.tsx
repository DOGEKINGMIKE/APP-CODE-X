import React from 'react';
import { Blocks, Clock, Sparkles } from 'lucide-react';

const NoCodeBuilder: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-card items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Blocks className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-3">No-Code Builder</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Coming Soon</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Build apps visually without writing code. Drag-and-drop components, design layouts, and ship faster than ever.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-left">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Visual Editor</span>
            </div>
            <p className="text-xs text-muted-foreground">Drag & drop UI components to build layouts</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-left">
            <div className="flex items-center gap-2 mb-1">
              <Blocks className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Component Library</span>
            </div>
            <p className="text-xs text-muted-foreground">Pre-built components for rapid development</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoCodeBuilder;
