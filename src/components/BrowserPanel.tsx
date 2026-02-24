import React, { useState, useRef, useCallback } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Home, Plus, X, Lock, ExternalLink, Star, StarOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrowserTab {
  id: string;
  url: string;
  title: string;
  error: boolean;
}

const BOOKMARKS_KEY = 'csx11-bookmarks';

export const clearBrowserData = () => {
  try { localStorage.removeItem(BOOKMARKS_KEY); } catch {}
};

const DEFAULT_HOME = 'https://www.google.com/webhp?igu=1';

/** Convert YouTube watch URLs to embed URLs so they work in an iframe */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID  ->  youtube.com/embed/ID
    if ((u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') && u.pathname === '/watch') {
      const videoId = u.searchParams.get('v');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
    // youtu.be/ID  ->  youtube.com/embed/ID
    if (u.hostname === 'youtu.be') {
      const videoId = u.pathname.slice(1);
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
    // youtube.com/shorts/ID -> youtube.com/embed/ID
    if ((u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') && u.pathname.startsWith('/shorts/')) {
      const videoId = u.pathname.replace('/shorts/', '');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
  } catch {}
  return url;
}

/** Sites known to block iframe embedding */
const BLOCKED_SITES = ['twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'github.com', 'linkedin.com', 'reddit.com'];

function isLikelyBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return BLOCKED_SITES.some(s => hostname === s || hostname.endsWith('.' + s));
  } catch { return false; }
}

const BrowserPanel: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab_1', url: DEFAULT_HOME, title: 'Home', error: false },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_1');
  const [urlInput, setUrlInput] = useState(DEFAULT_HOME);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const saveBookmarks = (bm: string[]) => {
    setBookmarks(bm);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm));
  };

  const navigate = useCallback((url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl) return;
    if (!/^https?:\/\//i.test(finalUrl)) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(finalUrl)}`;
      }
    }
    const embedUrl = toEmbedUrl(finalUrl);
    const blocked = isLikelyBlocked(embedUrl);
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: embedUrl, error: blocked } : t));
    setUrlInput(finalUrl);
  }, [activeTabId]);

  const openInNewTab = () => {
    window.open(activeTab.url, '_blank', 'noopener,noreferrer');
  };

  const createTab = () => {
    const newTab: BrowserTab = {
      id: `tab_${Date.now()}`,
      url: DEFAULT_HOME,
      title: 'New Tab',
      error: false,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput(DEFAULT_HOME);
  };

  const closeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTabId === id) {
      setActiveTabId(next[next.length - 1].id);
      setUrlInput(next[next.length - 1].url);
    }
  };

  const switchTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) setUrlInput(tab.url);
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(activeTab.url)) {
      saveBookmarks(bookmarks.filter(b => b !== activeTab.url));
    } else {
      saveBookmarks([...bookmarks, activeTab.url]);
    }
  };

  const isBookmarked = bookmarks.includes(activeTab.url);
  const isSecure = activeTab.url.startsWith('https://');
  const showBlocked = activeTab.error || isLikelyBlocked(activeTab.url);

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Tab bar */}
      <div className="bg-card border-b border-border flex items-center shrink-0 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`group flex items-center gap-1 px-2.5 h-8 border-r border-border cursor-pointer text-xs shrink-0 max-w-[160px] transition-colors relative ${
              tab.id === activeTabId ? 'bg-editor-background text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => switchTab(tab.id)}
          >
            {tab.id === activeTabId && <span className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />}
            <Globe className="w-3 h-3 shrink-0 text-primary" />
            <span className="truncate">{tab.title}</span>
            {tabs.length > 1 && (
              <button onClick={e => { e.stopPropagation(); closeTab(tab.id); }} className="ml-auto opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button onClick={createTab} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* URL bar */}
      <div className="h-9 bg-card border-b border-border flex items-center gap-1.5 px-2 shrink-0">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => navigate(DEFAULT_HOME)}>
          <Home className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => iframeRef.current?.contentWindow?.location.reload()}>
          <RotateCw className="w-3 h-3" />
        </Button>
        <div className="flex-1 flex items-center gap-1.5 bg-muted rounded px-2 py-1">
          {isSecure && <Lock className="w-3 h-3 text-primary shrink-0" />}
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(urlInput)}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
            placeholder="Enter URL or search..."
          />
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleBookmark}>
          {isBookmarked ? <Star className="w-3 h-3 text-primary fill-primary" /> : <StarOff className="w-3 h-3 text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={openInNewTab} title="Open in new tab">
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>

      {/* Bookmarks bar */}
      {bookmarks.length > 0 && (
        <div className="h-7 bg-card border-b border-border flex items-center gap-1 px-2 overflow-x-auto scrollbar-none shrink-0">
          {bookmarks.map(bm => {
            let label = bm;
            try { label = new URL(bm).hostname.replace('www.', ''); } catch {}
            return (
              <button
                key={bm}
                onClick={() => navigate(bm)}
                className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-muted/50 hover:bg-muted shrink-0 transition-colors truncate max-w-[120px]"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 relative bg-preview-background">
        {showBlocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">This site cannot be displayed in an iframe</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Many websites block embedding for security. You can open this page directly in a new browser tab instead.
              </p>
            </div>
            <Button onClick={openInNewTab} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
            <p className="text-[10px] text-muted-foreground font-mono truncate max-w-full">{activeTab.url}</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            className="w-full h-full border-0"
            title="Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
            allow="clipboard-write; autoplay; encrypted-media; fullscreen; picture-in-picture"
            onError={() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, error: true } : t))}
          />
        )}
      </div>
    </div>
  );
};

export default BrowserPanel;
