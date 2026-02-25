import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink, ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  onConsoleMessage?: (level: string, message: string) => void;
}

/** Script injected into the preview iframe to capture console output */
const CONSOLE_CAPTURE_SCRIPT = `
<script>
(function(){
  var _post = function(level, args){
    try {
      window.parent.postMessage({
        source: 'x11-preview',
        level: level,
        message: Array.prototype.slice.call(args).map(function(a){
          return typeof a === 'object' ? JSON.stringify(a) : String(a);
        }).join(' ')
      }, '*');
    } catch(e){}
  };
  var _log = console.log, _warn = console.warn, _err = console.error, _info = console.info;
  console.log   = function(){ _post('log',   arguments); _log.apply(console, arguments); };
  console.warn  = function(){ _post('warn',  arguments); _warn.apply(console, arguments); };
  console.error = function(){ _post('error', arguments); _err.apply(console, arguments); };
  console.info  = function(){ _post('info',  arguments); _info.apply(console, arguments); };
  window.onerror = function(msg, src, line, col){ _post('error', ['Runtime error: ' + msg + ' (line ' + line + ')']); };
  window.onunhandledrejection = function(e){ _post('error', ['Unhandled promise rejection: ' + (e.reason || e)]); };
})();
</script>`;

const PreviewPanel: React.FC<PreviewPanelProps> = ({ files, currentFile, onConsoleMessage }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [sandboxStrict, setSandboxStrict] = useState(false);

  // Listen for messages from the preview iframe
  useEffect(() => {
    if (!onConsoleMessage) return;
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.source === 'x11-preview') {
        onConsoleMessage(e.data.level, e.data.message);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onConsoleMessage]);

  const generatedHTML = useMemo(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html')) || currentFile;
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'));

    let html = htmlFile?.content || `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Live Preview</title><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;color:#fff}.container{max-width:800px;margin:0 auto;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);padding:40px;border-radius:16px;border:1px solid rgba(255,255,255,.15)}h1{text-align:center;margin-bottom:30px;font-weight:700}</style></head><body><div class="container"><h1>Code Studio X-11 Preview</h1><div style="background:rgba(255,255,255,.08);padding:20px;border-radius:12px;border-left:4px solid rgba(255,255,255,.3)"><h3>Create HTML, CSS, and JavaScript files to see them render here.</h3><p>Currently detected files:</p><ul>${files.map(f => '<li>' + f.name + ' (' + f.type + ')</li>').join('')}</ul></div></div></body></html>`;

    // Inject console capture right after <head>
    html = html.replace(/<head>/i, '<head>' + CONSOLE_CAPTURE_SCRIPT);

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

  const sandboxAttr = sandboxStrict
    ? 'allow-scripts'
    : 'allow-scripts allow-modals allow-forms allow-popups allow-same-origin';

  return (
    <div className="h-full bg-preview-background flex flex-col">
      <div className="h-8 bg-card border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Live Preview</span>
          {sandboxStrict && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">STRICT</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSandboxStrict(s => !s)}
                className={`h-6 w-6 p-0 hover:bg-muted ${sandboxStrict ? 'text-yellow-400' : 'text-muted-foreground'}`}
                aria-label={sandboxStrict ? 'Disable strict sandbox' : 'Enable strict sandbox'}
              >
                {sandboxStrict ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{sandboxStrict ? 'Strict sandbox ON (more secure)' : 'Strict sandbox OFF (default)'}</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-6 w-6 p-0 hover:bg-muted" aria-label="Refresh preview">
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab} className="h-6 w-6 p-0 hover:bg-muted" aria-label="Open in new tab">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <iframe
          key={`${refreshKey}-${sandboxStrict}`}
          srcDoc={generatedHTML}
          className="w-full h-full border-0 bg-preview-background"
          title="Live Preview"
          sandbox={sandboxAttr}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
