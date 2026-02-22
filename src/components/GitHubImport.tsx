import React, { useState } from 'react';
import { GitBranch, Download, Loader2, AlertCircle, CheckCircle2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GitHubImportProps {
  onImportFiles: (files: { name: string; content: string }[]) => void;
}

const GitHubImport: React.FC<GitHubImportProps> = ({ onImportFiles }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const parseRepoUrl = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) return { owner: match[1], repo: match[2].replace('.git', '') };
    // Also accept owner/repo format
    const simple = url.match(/^([^/]+)\/([^/]+)$/);
    if (simple) return { owner: simple[1], repo: simple[2] };
    return null;
  };

  const fetchRepoFiles = async (owner: string, repo: string, path = ''): Promise<{ name: string; content: string }[]> => {
    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (!resp.ok) throw new Error(`GitHub API error: ${resp.status}`);
    const items = await resp.json();
    const files: { name: string; content: string }[] = [];

    for (const item of items) {
      if (item.type === 'file' && item.size < 100000) {
        // Only import text files under 100KB
        const ext = item.name.split('.').pop()?.toLowerCase() || '';
        const textExts = ['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'md', 'txt', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'yml', 'yaml', 'toml', 'xml', 'svg', 'sh', 'sql', 'env', 'gitignore', 'sol'];
        if (textExts.includes(ext) || !item.name.includes('.')) {
          try {
            const fileResp = await fetch(item.download_url);
            const content = await fileResp.text();
            const filePath = path ? `${path}/${item.name}` : item.name;
            files.push({ name: filePath, content });
          } catch { /* skip binary or large files */ }
        }
      }
      // Recurse into directories (limit depth)
      if (item.type === 'dir' && path.split('/').length < 3) {
        const subPath = path ? `${path}/${item.name}` : item.name;
        const subFiles = await fetchRepoFiles(owner, repo, subPath);
        files.push(...subFiles);
      }
    }
    return files;
  };

  const handleImport = async () => {
    setError(null);
    setSuccess(false);
    const parsed = parseRepoUrl(repoUrl.trim());
    if (!parsed) { setError('Enter a valid GitHub URL or owner/repo'); return; }

    setLoading(true);
    try {
      const files = await fetchRepoFiles(parsed.owner, parsed.repo);
      if (files.length === 0) { setError('No importable files found'); setLoading(false); return; }
      onImportFiles(files);
      setFileCount(files.length);
      setSuccess(true);
      setRepoUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-explorer-background">
      <div className="p-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Control</span>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="text-center mb-4">
          <GitBranch className="w-8 h-8 mx-auto mb-2 text-primary opacity-60" />
          <p className="text-sm font-medium text-foreground">Import from GitHub</p>
          <p className="text-xs text-muted-foreground mt-1">Import any public repository</p>
        </div>

        <div className="space-y-2">
          <Input
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
            placeholder="github.com/user/repo or user/repo"
            className="text-xs"
            disabled={loading}
          />
          <Button onClick={handleImport} disabled={loading || !repoUrl.trim()} className="w-full" size="sm">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Download className="w-3.5 h-3.5 mr-2" />}
            {loading ? 'Importing...' : 'Import Repository'}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2 rounded bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
            <span className="text-xs text-destructive">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-2 rounded bg-primary/10 border border-primary/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-xs text-foreground">Imported {fileCount} files successfully!</span>
          </div>
        )}

        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Quick Links</p>
          {['user/repo', 'facebook/react', 'vuejs/vue', 'sveltejs/svelte'].map(example => (
            <button
              key={example}
              onClick={() => setRepoUrl(example)}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <FolderOpen className="w-3 h-3" />
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubImport;
