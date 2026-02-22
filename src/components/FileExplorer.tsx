import React, { useState } from 'react';
import {
  Folder, FolderOpen, FileText, Plus, ChevronRight, Download, Trash2,
  FileCode, FileJson, FileType, Globe, Paintbrush, Braces, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onFileCreate: (name: string, type: 'file' | 'folder', parentId?: string) => void;
  onFileDelete?: (fileId: string) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onDownloadZip?: () => void;
  onDeleteAll?: () => void;
  selectedFileId?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files, onFileSelect, onFileCreate, onFileDelete, onFileRename, onDownloadZip, onDeleteAll, selectedFileId
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const toggleFolder = (folderId: string) => {
    const next = new Set(expandedFolders);
    if (next.has(folderId)) next.delete(folderId); else next.add(folderId);
    setExpandedFolders(next);
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim(), newFileName.includes('.') ? 'file' : 'folder');
      setNewFileName('');
      setShowNewFileInput(false);
    }
  };

  const startRename = (item: FileItem) => { setRenamingId(item.id); setRenameValue(item.name); };
  const commitRename = () => {
    if (renamingId && renameValue.trim() && onFileRename) onFileRename(renamingId, renameValue.trim());
    setRenamingId(null); setRenameValue('');
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, React.ReactNode> = {
      html: <Globe className="w-4 h-4 text-orange-400" />,
      css: <Paintbrush className="w-4 h-4 text-blue-400" />,
      scss: <Paintbrush className="w-4 h-4 text-pink-400" />,
      js: <Braces className="w-4 h-4 text-yellow-400" />,
      jsx: <Braces className="w-4 h-4 text-yellow-300" />,
      ts: <FileCode className="w-4 h-4 text-blue-500" />,
      tsx: <FileCode className="w-4 h-4 text-blue-400" />,
      json: <FileJson className="w-4 h-4 text-green-400" />,
      md: <FileType className="w-4 h-4 text-gray-400" />,
      py: <FileCode className="w-4 h-4 text-green-500" />,
      sol: <FileCode className="w-4 h-4 text-purple-400" />,
    };
    return iconMap[ext || ''] || <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const filteredFiles = filterText
    ? files.filter(f => f.name.toLowerCase().includes(filterText.toLowerCase()))
    : files;

  const renderFileItem = (item: FileItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedFileId === item.id;
    const isRenaming = renamingId === item.id;

    return (
      <div key={item.id}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`file-explorer-item group flex items-center gap-1.5 px-2 py-[5px] cursor-pointer rounded-sm ${isSelected ? 'selected' : ''}`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => item.type === 'folder' ? toggleFolder(item.id) : onFileSelect(item)}
            >
              {item.type === 'folder' && (
                <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
              )}
              {item.type === 'folder' ? (
                isExpanded ? <FolderOpen className="w-4 h-4 text-primary shrink-0" /> : <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : getFileIcon(item.name)}
              {isRenaming ? (
                <input
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                  className="flex-1 bg-input border border-primary rounded px-1.5 py-0 text-xs text-foreground focus:outline-none"
                  autoFocus onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="text-[13px] text-foreground truncate">{item.name}</span>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => startRename(item)}>Rename</ContextMenuItem>
            <ContextMenuItem onClick={() => onFileDelete?.(item.id)} className="text-destructive">Delete</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setShowNewFileInput(true)}>New File</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {item.type === 'folder' && isExpanded && item.children?.map(child => renderFileItem(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full bg-explorer-background flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" onClick={() => setShowFilter(v => !v)} className={`h-6 w-6 p-0 ${showFilter ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} title="Filter files">
              <Filter className="w-3.5 h-3.5" />
            </Button>
            {onDeleteAll && files.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onDeleteAll} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" title="Delete All Files">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            {onDownloadZip && (
              <Button variant="ghost" size="sm" onClick={onDownloadZip} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" title="Download ZIP">
                <Download className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowNewFileInput(true)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {showFilter && (
          <input type="text" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Filter files..." className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none mb-1" autoFocus />
        )}
        {showNewFileInput && (
          <input type="text" value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateFile(); if (e.key === 'Escape') { setShowNewFileInput(false); setNewFileName(''); } }} placeholder="filename.ext (or folder name)" className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none" autoFocus />
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {filteredFiles.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-8 px-4">
            {filterText ? 'No files match filter' : 'No files yet'}
          </div>
        ) : (
          filteredFiles.map(file => renderFileItem(file))
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
