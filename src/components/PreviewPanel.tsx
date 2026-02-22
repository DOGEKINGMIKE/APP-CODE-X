import React, { useMemo } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
}

interface PreviewPanelProps {
  files: FileItem[];
  currentFile?: FileItem;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ files, currentFile }) => {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const generatedHTML = useMemo(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html')) || currentFile;
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'));

    let html = htmlFile?.content || `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Live Preview</title><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh}.container{max-width:800px;margin:0 auto;background:#fff;padding:40px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.2)}h1{color:#333;text-align:center;margin-bottom:30px}</style></head><body><div class="container"><h1>🚀 Code Editor Live Preview</h1><div style="background:#f8f9fa;padding:20px;border-radius:8px;border-left:4px solid #667eea"><h3>Create HTML, CSS, and JavaScript files to see them render here!</h3><p>Currently detected files:</p><ul>${files.map(f => '<li>📄 ' + f.name + ' (' + f.type + ')</li>').join('')}</ul></div></div></body></html>`;

    if (cssFiles.length > 0) {
      const cssContent = cssFiles.map(f => f.content).join('\n');
      html = html.replace('</head>', `<style>${cssContent}</style></head>`);
    }

    if (jsFiles.length > 0) {
      const jsContent = jsFiles.map(f => f.content).join('\n');
      html = html.replace('</body>', `<script>${jsContent}<\/script></body>`);
    }

    return html;
  }, [files, currentFile, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleOpenInNewTab = () => {
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="h-full bg-preview-background flex flex-col">
      <div className="h-8 bg-card border-b border-border flex items-center justify-between px-3">
        <span className="text-xs text-muted-foreground">Live Preview</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-6 w-6 p-0 hover:bg-muted">
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab} className="h-6 w-6 p-0 hover:bg-muted">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <iframe key={refreshKey} srcDoc={generatedHTML} className="w-full h-full border-0 bg-preview-background" title="Live Preview" sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin" />
      </div>
    </div>
  );
};

export default PreviewPanel;
