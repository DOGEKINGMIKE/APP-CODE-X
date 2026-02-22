import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NovaAIPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">NOVA AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => window.open('https://x11ai.vercel.app/', '_blank')}>
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex-1 relative">
        <iframe src="https://x11ai.vercel.app/" className="w-full h-full border-0" title="NOVA AI Assistant" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" allow="clipboard-write" />
      </div>
    </div>
  );
};

export default NovaAIPanel;
