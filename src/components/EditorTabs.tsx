import React, { useRef, useEffect } from 'react';
import { X, FileText, Globe, Paintbrush, Braces, FileCode, FileJson, FileType } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

interface EditorTabsProps {
  openFiles: FileItem[];
  activeFileId?: string;
  onSelectFile: (file: FileItem) => void;
  onCloseFile: (fileId: string) => void;
}

const getFileIcon = (name: string, size = 'w-3.5 h-3.5') => {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons: Record<string, React.ReactNode> = {
    html: <Globe className={`${size} text-orange-400`} />,
    css: <Paintbrush className={`${size} text-blue-400`} />,
    scss: <Paintbrush className={`${size} text-pink-400`} />,
    js: <Braces className={`${size} text-yellow-400`} />,
    jsx: <Braces className={`${size} text-cyan-400`} />,
    ts: <FileCode className={`${size} text-blue-500`} />,
    tsx: <FileCode className={`${size} text-cyan-500`} />,
    json: <FileJson className={`${size} text-yellow-300`} />,
    md: <FileType className={`${size} text-gray-400`} />,
    py: <FileCode className={`${size} text-green-500`} />,
    sol: <FileCode className={`${size} text-purple-400`} />,
  };
  return icons[ext || ''] || <FileText className={`${size} text-muted-foreground`} />;
};

const EditorTabs: React.FC<EditorTabsProps> = ({ openFiles, activeFileId, onSelectFile, onCloseFile }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !activeFileId) return;
    const activeTab = scrollRef.current.querySelector(`[data-tab-id="${activeFileId}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeFileId]);

  if (openFiles.length === 0) return null;

  return (
    <div className="bg-card border-b border-border shrink-0">
      <div ref={scrollRef} className="flex items-center overflow-x-auto scrollbar-none">
        {openFiles.map(file => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              data-tab-id={file.id}
              className={`group flex items-center gap-1.5 px-3 h-9 border-r border-border cursor-pointer text-xs shrink-0 transition-all relative ${
                isActive ? 'bg-editor-background text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => onSelectFile(file)}
            >
              {isActive && <span className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />}
              {getFileIcon(file.name, 'w-3 h-3')}
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={e => { e.stopPropagation(); onCloseFile(file.id); }}
                className={`ml-1 rounded p-0.5 transition-opacity ${
                  isActive ? 'opacity-60 hover:opacity-100 hover:bg-muted' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-muted'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditorTabs;
