import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Bot, Terminal, Eye, Blocks, Download, Palette, Sparkles, Search, Code2, FolderOpen, Settings, StickyNote, Globe, Scissors, LogOut, Save, Cloud, Loader2, User, CalendarDays } from 'lucide-react';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import PreviewPanel from '@/components/PreviewPanel';
import StatusBar from '@/components/StatusBar';
import WelcomeScreen from '@/components/WelcomeScreen';
import AIChat from '@/components/AIChat';
import TerminalPanel from '@/components/TerminalPanel';
import EditorTabs from '@/components/EditorTabs';
import NoCodeBuilder from '@/components/NoCodeBuilder';
import NovaAIPanel from '@/components/NovaAIPanel';
import CommandPalette from '@/components/CommandPalette';
import SearchReplaceBar from '@/components/SearchReplaceBar';
import SettingsPanel from '@/components/SettingsPanel';
import NotesPanel from '@/components/NotesPanel';
import BrowserPanel from '@/components/BrowserPanel';
import SnippetsPanel from '@/components/SnippetsPanel';
import MarkdownPreview from '@/components/MarkdownPreview';
import GitHubImport from '@/components/GitHubImport';
import ActivityBar, { type ActivityView } from '@/components/ActivityBar';
import CalendarPanel from '@/components/CalendarPanel';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  content?: string;
  language?: string;
}

interface LogEntry {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info' | 'system';
  message: string;
  timestamp: Date;
}

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
}

type MobileTab = 'code' | 'preview' | 'ai' | 'nova' | 'files' | 'terminal' | 'notes' | 'browser' | 'snippets' | 'calendar';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const projectsHook = useProjects(user);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [fileCounter, setFileCounter] = useState(1);
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 0, type: 'system', message: 'Code Studio X-11 ready. AI assistant enabled. Press Ctrl+K for commands.', timestamp: new Date() }]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [activeView, setActiveView] = useState<ActivityView | null>('explorer');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('code');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true, autoSave: false,
  });
  const { theme, setTheme, currentTheme, themes } = useTheme();
  const isMobile = useIsMobile();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  // Auto-save when autoSave is enabled
  useEffect(() => {
    if (!editorSettings.autoSave || !user || !projectsHook.activeProjectId) return;
    const interval = setInterval(() => {
      if (files.length > 0) projectsHook.saveAllFiles(files);
    }, 30000);
    return () => clearInterval(interval);
  }, [editorSettings.autoSave, files, user, projectsHook.activeProjectId]);

  // Load files when project changes
  useEffect(() => {
    if (projectsHook.files.length > 0 && projectsHook.activeProjectId) {
      setFiles(projectsHook.files);
    }
  }, [projectsHook.files, projectsHook.activeProjectId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setActiveView(v => v === 'explorer' ? null : 'explorer'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); setShowTerminal(v => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSaveToCloud(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && selectedFile) { e.preventDefault(); handleCloseFile(selectedFile.id); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); setShowSearchBar(v => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') { e.preventDefault(); setShowSearchBar(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); setActiveView(v => v === 'settings' ? 'explorer' : 'settings'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedFile, files]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), type, message, timestamp: new Date() }]);
  }, []);

  const generateFileId = () => `file_${Date.now()}_${fileCounter}`;

  const createDefaultContent = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const templates: Record<string, string> = {
      'html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My App</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="container">\n        <h1>Hello World!</h1>\n        <p>Start building here.</p>\n    </div>\n    <script src="script.js"></script>\n</body>\n</html>`,
      'css': `/* Styles */\n.container {\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 40px 20px;\n    font-family: system-ui, sans-serif;\n    text-align: center;\n}\n\nh1 {\n    background: linear-gradient(135deg, #667eea, #764ba2);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n    background-clip: text;\n}`,
      'js': `// JavaScript\nconsole.log('App loaded!');\n\ndocument.addEventListener('DOMContentLoaded', () => {\n    console.log('Ready!');\n});`,
      'ts': `// TypeScript\ninterface AppConfig {\n  name: string;\n  version: string;\n}\n\nconst config: AppConfig = {\n  name: 'My App',\n  version: '1.0.0'\n};\n\nconsole.log(config);`,
      'py': `# Python\ndef main():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    main()`,
      'json': `{\n  "name": "my-project",\n  "version": "1.0.0"\n}`,
      'md': `# My Project\n\nA description of your project.\n\n## Features\n\n- Feature 1\n- Feature 2`,
      'jsx': `import React, { useState } from 'react';\n\nfunction App() {\n    const [count, setCount] = useState(0);\n    return (\n        <div>\n            <h1>React App</h1>\n            <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n        </div>\n    );\n}\n\nexport default App;`,
      'tsx': `import React, { useState } from 'react';\n\nconst App: React.FC = () => {\n    const [count, setCount] = useState(0);\n    return (\n        <div>\n            <h1>TypeScript React App</h1>\n            <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n        </div>\n    );\n};\n\nexport default App;`,
      'sol': `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract MyContract {\n    string public name = "My Token";\n    \n    function setName(string memory _name) public {\n        name = _name;\n    }\n}`,
    };
    return templates[ext || ''] || `// ${fileName}\n`;
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown',
      'scss': 'scss', 'less': 'less', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
      'sql': 'sql', 'sh': 'shell', 'go': 'go', 'rs': 'rust', 'rb': 'ruby',
      'java': 'java', 'c': 'c', 'cpp': 'cpp', 'cs': 'csharp', 'php': 'php',
      'swift': 'swift', 'kt': 'kotlin', 'dart': 'dart', 'r': 'r', 'scala': 'scala',
      'sol': 'solidity',
    };
    return map[ext || ''] || 'plaintext';
  };

  const handleSaveToCloud = useCallback(async () => {
    if (!user || !projectsHook.activeProjectId) {
      // If no active project, create one
      if (user && files.length > 0) {
        const project = await projectsHook.createProject('My Project');
        if (project) {
          await projectsHook.loadFiles(project.id);
          await projectsHook.saveAllFiles(files);
          toast.success('Project saved to cloud!');
          addLog('system', 'Project saved to cloud');
        }
      }
      return;
    }
    await projectsHook.saveAllFiles(files);
    toast.success('Saved to cloud!');
    addLog('system', 'Project saved to cloud');
  }, [user, files, projectsHook, addLog]);

  const handleFileCreate = useCallback((name: string, type: 'file' | 'folder') => {
    const newFile: FileItem = {
      id: generateFileId(), name, type,
      content: type === 'file' ? createDefaultContent(name) : undefined,
      children: type === 'folder' ? [] : undefined,
    };
    setFiles(prev => [...prev, newFile]);
    setFileCounter(c => c + 1);
    if (type === 'file') {
      setSelectedFile(newFile);
      setOpenFiles(prev => prev.some(f => f.id === newFile.id) ? prev : [...prev, newFile]);
      addLog('system', `Created ${name}`);
      if (isMobile) setMobileTab('code');
      // Auto-save to cloud
      if (user && projectsHook.activeProjectId) {
        projectsHook.saveFile(newFile);
      }
    }
  }, [fileCounter, addLog, isMobile, user, projectsHook]);

  const handleFileSelect = useCallback((file: FileItem) => {
    if (file.type === 'file') {
      const latestFile = files.find(f => f.id === file.id) || file;
      setSelectedFile(latestFile);
      setOpenFiles(prev => prev.some(f => f.id === latestFile.id) ? prev.map(f => f.id === latestFile.id ? latestFile : f) : [...prev, latestFile]);
      if (isMobile) setMobileTab('code');
    }
  }, [files, isMobile]);

  const handleFileDelete = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      const remaining = openFiles.filter(f => f.id !== fileId);
      setSelectedFile(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
    // Delete from cloud too
    if (user) projectsHook.deleteFile(fileId);
    addLog('system', 'Deleted file');
  }, [selectedFile, openFiles, addLog, user, projectsHook]);

  const handleDeleteAll = useCallback(() => {
    setFiles([]); setOpenFiles([]); setSelectedFile(null);
    addLog('system', 'All files deleted');
  }, [addLog]);

  const handleFileRename = useCallback((fileId: string, newName: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
    setOpenFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
    if (selectedFile?.id === fileId) setSelectedFile(prev => prev ? { ...prev, name: newName } : null);
    addLog('system', `Renamed to ${newName}`);
  }, [selectedFile, addLog]);

  const handleCloseFile = useCallback((fileId: string) => {
    setOpenFiles(prev => {
      const next = prev.filter(f => f.id !== fileId);
      if (selectedFile?.id === fileId) setSelectedFile(next.length > 0 ? next[next.length - 1] : null);
      return next;
    });
  }, [selectedFile]);

  const handleCodeChange = useCallback((newContent: string) => {
    if (!selectedFile) return;
    const updatedFile = { ...selectedFile, content: newContent };
    setSelectedFile(updatedFile);
    setOpenFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
    setFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, content: newContent } : f));
  }, [selectedFile]);

  const handleAIFilesGenerated = useCallback((aiFiles: { name: string; content: string; action: string }[]) => {
    aiFiles.forEach(af => {
      const existing = files.find(f => f.name === af.name);
      if (existing) {
        const updated = { ...existing, content: af.content };
        setFiles(prev => prev.map(f => f.id === existing.id ? updated : f));
        setOpenFiles(prev => prev.map(f => f.id === existing.id ? updated : f));
        if (selectedFile?.id === existing.id) setSelectedFile(updated);
        addLog('system', `AI updated: ${af.name}`);
      } else {
        const newFile: FileItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: af.name, type: 'file', content: af.content,
        };
        setFiles(prev => [...prev, newFile]);
        setOpenFiles(prev => [...prev, newFile]);
        setSelectedFile(newFile);
        addLog('system', `AI created: ${af.name}`);
      }
    });
  }, [files, selectedFile, addLog]);

  const handleGitHubImport = useCallback((importedFiles: { name: string; content: string }[]) => {
    importedFiles.forEach(f => {
      const newFile: FileItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: f.name, type: 'file', content: f.content,
      };
      setFiles(prev => [...prev, newFile]);
    });
    addLog('system', `Imported ${importedFiles.length} files from GitHub`);
    toast.success(`Imported ${importedFiles.length} files!`);
  }, [addLog]);

  const handleDownloadZip = useCallback(async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    files.forEach(f => { if (f.type === 'file' && f.content) zip.file(f.name, f.content); });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'project.zip');
    addLog('system', 'Project exported as ZIP');
  }, [files, addLog]);

  const handleSearch = useCallback((query: string, options: { caseSensitive: boolean; regex: boolean }) => {
    if (!selectedFile?.content || !query) { setSearchMatchCount(0); return; }
    try {
      const flags = options.caseSensitive ? 'g' : 'gi';
      const pattern = options.regex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = selectedFile.content.match(pattern);
      setSearchMatchCount(matches?.length || 0);
    } catch { setSearchMatchCount(0); }
  }, [selectedFile]);

  const handleReplace = useCallback((search: string, replace: string, all: boolean) => {
    if (!selectedFile?.content || !search) return;
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = all ? new RegExp(escaped, 'g') : new RegExp(escaped);
    const newContent = selectedFile.content.replace(pattern, replace);
    handleCodeChange(newContent);
    addLog('system', `Replaced ${all ? 'all' : 'first'}: "${search}" -> "${replace}"`);
  }, [selectedFile, handleCodeChange, addLog]);

  const handleTerminalCommand = useCallback((cmd: string) => {
    addLog('log', `$ ${cmd}`);
    const parts = cmd.trim().split(/\s+/);
    const base = parts[0];
    const commands: Record<string, () => void> = {
      'help': () => addLog('info', 'Commands: ls, clear, files, run, zip, save, npm install <pkg>, theme <name>, deleteall, nova, settings, search, notes, browser, snippets, calendar, github, help\nShortcuts: Ctrl+K (commands), Ctrl+B (explorer), Ctrl+` (terminal), Ctrl+S (save), Ctrl+F (search), Ctrl+, (settings)'),
      'ls': () => addLog('info', files.map(f => `${f.type === 'folder' ? '[dir]' : '    '} ${f.name}`).join('\n') || '(empty)'),
      'clear': () => setLogs([]),
      'files': () => addLog('info', `${files.length} files in project`),
      'run': () => addLog('system', 'Running preview...'),
      'zip': () => handleDownloadZip(),
      'save': () => handleSaveToCloud(),
      'deleteall': () => handleDeleteAll(),
      'nova': () => { if (isMobile) setMobileTab('nova'); else setActiveView('nova'); addLog('system', 'Opened NOVA AI'); },
      'settings': () => { setActiveView('settings'); addLog('system', 'Opened settings'); },
      'search': () => { setShowSearchBar(true); addLog('system', 'Search bar opened'); },
      'notes': () => { if (isMobile) setMobileTab('notes'); else setActiveView('notes'); addLog('system', 'Opened notes'); },
      'browser': () => { if (isMobile) setMobileTab('browser'); else setActiveView('browser'); addLog('system', 'Opened browser'); },
      'snippets': () => { if (isMobile) setMobileTab('snippets'); else setActiveView('snippets'); addLog('system', 'Opened snippets'); },
      'github': () => { setActiveView('git'); addLog('system', 'Opened GitHub import'); },
      'calendar': () => { if (isMobile) setMobileTab('calendar'); else setActiveView('calendar'); addLog('system', 'Opened calendar'); },
      'logout': () => { signOut(); addLog('system', 'Signed out'); },
      'whoami': () => addLog('info', user?.email || user?.id || 'Anonymous'),
    };
    if (base === 'npm' && parts[1] === 'install' && parts[2]) {
      addLog('info', `Installing ${parts.slice(2).join(', ')}...`);
      setTimeout(() => addLog('system', `Installed ${parts.slice(2).join(', ')} (simulated)`), 1200);
      return;
    }
    if (base === 'theme' && parts[1]) {
      const t = themes.find(th => th.id === parts[1] || th.name.toLowerCase().includes(parts[1]));
      if (t) { setTheme(t.id); addLog('system', `Theme: ${t.name}`); }
      else addLog('error', `Unknown theme. Available: ${themes.map(t => t.id).join(', ')}`);
      return;
    }
    const handler = commands[base];
    if (handler) handler();
    else addLog('error', `Unknown command: ${cmd}. Type 'help'.`);
  }, [files, addLog, handleDownloadZip, handleDeleteAll, handleSaveToCloud, themes, setTheme, isMobile, user, signOut]);

  const handleViewChange = useCallback((view: ActivityView) => {
    setActiveView(prev => prev === view ? null : view);
  }, []);

  const handleCommandAction = useCallback((action: string, payload?: any) => {
    switch (action) {
      case 'openFile': { const file = files.find(f => f.id === payload); if (file) handleFileSelect(file); break; }
      case 'newFile': handleFileCreate('untitled.txt', 'file'); break;
      case 'togglePreview': isMobile ? setMobileTab('preview') : setShowPreview(v => !v); break;
      case 'toggleAI': isMobile ? setMobileTab('ai') : setActiveView(v => v === 'ai' ? 'explorer' : 'ai'); break;
      case 'toggleNova': isMobile ? setMobileTab('nova') : setActiveView(v => v === 'nova' ? 'explorer' : 'nova'); break;
      case 'toggleTerminal': isMobile ? setMobileTab('terminal') : setShowTerminal(v => !v); break;
      case 'toggleExplorer': isMobile ? setMobileTab('files') : setActiveView(v => v === 'explorer' ? null : 'explorer'); break;
      case 'toggleNotes': isMobile ? setMobileTab('notes') : setActiveView(v => v === 'notes' ? 'explorer' : 'notes'); break;
      case 'toggleBrowser': isMobile ? setMobileTab('browser') : setActiveView(v => v === 'browser' ? 'explorer' : 'browser'); break;
      case 'toggleSnippets': isMobile ? setMobileTab('snippets') : setActiveView(v => v === 'snippets' ? 'explorer' : 'snippets'); break;
      case 'toggleCalendar': isMobile ? setMobileTab('calendar') : setActiveView(v => v === 'calendar' ? 'explorer' : 'calendar'); break;
      case 'setTheme': setTheme(payload); break;
      case 'downloadZip': handleDownloadZip(); break;
      case 'deleteAll': handleDeleteAll(); break;
      case 'saveToCloud': handleSaveToCloud(); break;
    }
  }, [files, handleFileSelect, handleFileCreate, setTheme, handleDownloadZip, handleDeleteAll, handleSaveToCloud, isMobile]);

  const isMarkdownFile = selectedFile?.name.endsWith('.md');

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) return <WelcomeScreen onCreateFile={handleFileCreate} />;

  const sidebarContent = activeView;
  const showSidebar = activeView !== null;

  // ---- MOBILE LAYOUT ----
  if (isMobile) {
    const mobileNavItems: { id: MobileTab; icon: React.ReactNode; label: string }[] = [
      { id: 'code', icon: <Code2 className="w-4 h-4" />, label: 'Code' },
      { id: 'preview', icon: <Eye className="w-4 h-4" />, label: 'Preview' },
      { id: 'ai', icon: <Bot className="w-4 h-4" />, label: 'AI' },
      { id: 'files', icon: <FolderOpen className="w-4 h-4" />, label: 'Files' },
      { id: 'notes', icon: <StickyNote className="w-4 h-4" />, label: 'Notes' },
      { id: 'browser', icon: <Globe className="w-4 h-4" />, label: 'Web' },
      { id: 'terminal', icon: <Terminal className="w-4 h-4" />, label: 'Term' },
      { id: 'snippets', icon: <Scissors className="w-4 h-4" />, label: 'Snips' },
      { id: 'calendar', icon: <CalendarDays className="w-4 h-4" />, label: 'Cal' },
    ];

    return (
      <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} onAction={handleCommandAction} files={files.filter(f => f.type === 'file').map(f => ({ id: f.id, name: f.name }))} themes={themes} />

        <div className="h-11 bg-card border-b border-border flex items-center justify-between px-3 shrink-0 safe-area-top">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">X-11</span>
            <span className="text-[10px] text-primary font-medium">MEMEXCORP</span>
          </div>
          <div className="flex items-center gap-0.5">
            {projectsHook.saving && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleSaveToCloud}>
              <Cloud className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCommandPaletteOpen(true)}>
              <Search className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Palette className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {themes.map(t => (
                  <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)} className={theme === t.id ? 'bg-primary/20' : ''}>{t.name}</DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleDownloadZip}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {mobileTab === 'code' && (
            <div className="h-full flex flex-col">
              <EditorTabs openFiles={openFiles} activeFileId={selectedFile?.id} onSelectFile={handleFileSelect} onCloseFile={handleCloseFile} />
              {showSearchBar && <SearchReplaceBar onSearch={handleSearch} onReplace={handleReplace} onClose={() => setShowSearchBar(false)} matchCount={searchMatchCount} />}
              <div className="flex-1 min-h-0">
                {selectedFile ? (
                  <CodeEditor value={selectedFile.content || ''} onChange={handleCodeChange} language={getLanguageFromFileName(selectedFile.name)} fileName={selectedFile.name} monacoTheme={currentTheme.monacoTheme} settings={editorSettings} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-editor-background">
                    <div className="text-center text-muted-foreground p-6">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a file to edit</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {mobileTab === 'preview' && <PreviewPanel files={files} currentFile={selectedFile || undefined} />}
          {mobileTab === 'ai' && <AIChat files={files} onFilesGenerated={handleAIFilesGenerated} userId={user?.id} />}
          {mobileTab === 'nova' && <NovaAIPanel />}
          {mobileTab === 'files' && <FileExplorer files={files} onFileSelect={handleFileSelect} onFileCreate={handleFileCreate} onFileDelete={handleFileDelete} onFileRename={handleFileRename} onDownloadZip={handleDownloadZip} onDeleteAll={handleDeleteAll} selectedFileId={selectedFile?.id} />}
          {mobileTab === 'terminal' && <TerminalPanel logs={logs} onClear={() => setLogs([])} onCommand={handleTerminalCommand} />}
          {mobileTab === 'notes' && <NotesPanel userId={user?.id} />}
          {mobileTab === 'browser' && <BrowserPanel />}
          {mobileTab === 'snippets' && <SnippetsPanel userId={user?.id} />}
          {mobileTab === 'calendar' && <CalendarPanel userId={user?.id} />}
        </div>

        <div className="bg-card border-t border-border flex items-center overflow-x-auto scrollbar-none shrink-0 safe-area-bottom">
          {mobileNavItems.map(item => (
            <button key={item.id} onClick={() => setMobileTab(item.id)} className={`flex flex-col items-center gap-0.5 py-2.5 px-1 min-w-0 flex-1 transition-colors shrink-0 ${mobileTab === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- DESKTOP LAYOUT ----
  const renderSidebarPanel = () => {
    switch (sidebarContent) {
      case 'explorer': return <FileExplorer files={files} onFileSelect={handleFileSelect} onFileCreate={handleFileCreate} onFileDelete={handleFileDelete} onFileRename={handleFileRename} onDownloadZip={handleDownloadZip} onDeleteAll={handleDeleteAll} selectedFileId={selectedFile?.id} />;
      case 'search': return (
        <div className="h-full flex flex-col bg-explorer-background">
          <div className="p-3 border-b border-border"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</span></div>
          <div className="p-3"><SearchReplaceBar onSearch={handleSearch} onReplace={handleReplace} onClose={() => setActiveView('explorer')} matchCount={searchMatchCount} /></div>
        </div>
      );
      case 'git': return <GitHubImport onImportFiles={handleGitHubImport} />;
      case 'nocode': return <NoCodeBuilder />;
      case 'ai': return <AIChat files={files} onFilesGenerated={handleAIFilesGenerated} userId={user?.id} />;
      case 'nova': return <NovaAIPanel />;
      case 'notes': return <NotesPanel userId={user?.id} />;
      case 'snippets': return <SnippetsPanel userId={user?.id} />;
      case 'settings': return <SettingsPanel settings={editorSettings} onSettingsChange={setEditorSettings} onClose={() => setActiveView('explorer')} />;
      case 'calendar': return <CalendarPanel userId={user?.id} />;
      default: return null;
    }
  };

  const isBrowserView = activeView === 'browser';

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} onAction={handleCommandAction} files={files.filter(f => f.type === 'file').map(f => ({ id: f.id, name: f.name }))} themes={themes} />

      {/* Title bar */}
      <div className="h-9 bg-status-background border-b border-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Code Studio X-11</span>
          <span className="text-[10px] text-primary font-medium tracking-wider">MEMEXCORP</span>
          {projectsHook.saving && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground" onClick={handleSaveToCloud}>
                <Cloud className="w-3 h-3 mr-1" /><span>Save</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save to Cloud (Ctrl+S)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground" onClick={() => setCommandPaletteOpen(true)}>
                <Search className="w-3 h-3 mr-1" /><span>Ctrl+K</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Command Palette</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground">
                <Palette className="w-3 h-3 mr-1" /> {currentTheme.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {themes.map(t => (
                <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)} className={theme === t.id ? 'bg-primary/20' : ''}>{t.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground" onClick={handleDownloadZip}>
                <Download className="w-3 h-3 mr-1" /> ZIP
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export as ZIP</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground">
                <User className="w-3 h-3 mr-1" /> {user?.email?.split('@')[0] || 'Guest'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">{user?.email || 'Anonymous'}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar activeView={activeView} onViewChange={handleViewChange} showTerminal={showTerminal} onToggleTerminal={() => setShowTerminal(v => !v)} showPreview={showPreview} onTogglePreview={() => setShowPreview(v => !v)} />

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {showSidebar && !isBrowserView && (
              <>
                <ResizablePanel defaultSize={20} minSize={12} maxSize={35}>
                  {renderSidebarPanel()}
                </ResizablePanel>
                <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />
              </>
            )}

            {isBrowserView ? (
              <ResizablePanel defaultSize={100}>
                <BrowserPanel />
              </ResizablePanel>
            ) : (
              <>
                <ResizablePanel defaultSize={showPreview ? 50 : 80} minSize={25}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                      <div className="h-full flex flex-col">
                        <EditorTabs openFiles={openFiles} activeFileId={selectedFile?.id} onSelectFile={handleFileSelect} onCloseFile={handleCloseFile} />
                        {showSearchBar && <SearchReplaceBar onSearch={handleSearch} onReplace={handleReplace} onClose={() => setShowSearchBar(false)} matchCount={searchMatchCount} />}
                        <div className="flex-1 min-h-0">
                          {selectedFile ? (
                            isMarkdownFile ? (
                              <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={50}>
                                  <CodeEditor value={selectedFile.content || ''} onChange={handleCodeChange} language={getLanguageFromFileName(selectedFile.name)} fileName={selectedFile.name} monacoTheme={currentTheme.monacoTheme} settings={editorSettings} />
                                </ResizablePanel>
                                <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />
                                <ResizablePanel defaultSize={50}>
                                  <MarkdownPreview content={selectedFile.content || ''} fileName={selectedFile.name} />
                                </ResizablePanel>
                              </ResizablePanelGroup>
                            ) : (
                              <CodeEditor value={selectedFile.content || ''} onChange={handleCodeChange} language={getLanguageFromFileName(selectedFile.name)} fileName={selectedFile.name} monacoTheme={currentTheme.monacoTheme} settings={editorSettings} />
                            )
                          ) : (
                            <div className="h-full flex items-center justify-center bg-editor-background">
                              <div className="text-center text-muted-foreground">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-medium mb-1">No file open</p>
                                <p className="text-xs opacity-60">Open a file from the explorer or press Ctrl+K</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ResizablePanel>
                    {showTerminal && (
                      <>
                        <ResizableHandle className="h-px bg-border hover:bg-primary/50 transition-colors" />
                        <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                          <TerminalPanel logs={logs} onClear={() => setLogs([])} onCommand={handleTerminalCommand} />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </ResizablePanel>

                {showPreview && (
                  <>
                    <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />
                    <ResizablePanel defaultSize={30} minSize={15}>
                      <PreviewPanel files={files} currentFile={selectedFile || undefined} />
                    </ResizablePanel>
                  </>
                )}
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>

      <StatusBar currentFile={selectedFile ? { name: selectedFile.name, language: getLanguageFromFileName(selectedFile.name) } : undefined} fileCount={files.length} isPreviewMode={showPreview} themeName={currentTheme.name} />
    </div>
  );
};

export default Index;
