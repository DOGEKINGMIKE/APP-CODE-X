import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  fileName?: string;
  monacoTheme?: string;
  settings?: EditorSettings;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value, onChange, language, fileName, monacoTheme = 'vs-dark', settings,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && settings) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        minimap: { enabled: settings.minimap },
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (monacoRef.current && monacoTheme) {
      monacoRef.current.editor.setTheme(monacoTheme);
    }
  }, [monacoTheme]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme('monokai', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F92672' },
        { token: 'string', foreground: 'E6DB74' },
        { token: 'number', foreground: 'AE81FF' },
        { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
        { token: 'function', foreground: 'A6E22E' },
        { token: 'variable', foreground: 'F8F8F2' },
      ],
      colors: { 'editor.background': '#272822', 'editor.foreground': '#F8F8F2' },
    });

    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FF79C6' },
        { token: 'string', foreground: 'F1FA8C' },
        { token: 'number', foreground: 'BD93F9' },
        { token: 'type', foreground: '8BE9FD', fontStyle: 'italic' },
        { token: 'function', foreground: '50FA7B' },
      ],
      colors: { 'editor.background': '#282A36', 'editor.foreground': '#F8F8F2' },
    });

    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'comment', foreground: '8B949E', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'FF7B72' },
        { token: 'string', foreground: 'A5D6FF' },
        { token: 'number', foreground: '79C0FF' },
        { token: 'type', foreground: 'FFA657' },
        { token: 'function', foreground: 'D2A8FF' },
      ],
      colors: { 'editor.background': '#0D1117', 'editor.foreground': '#C9D1D9' },
    });

    monaco.editor.defineTheme('light', {
      base: 'vs', inherit: true, rules: [],
      colors: { 'editor.background': '#FFFFFF' },
    });

    monaco.editor.setTheme(monacoTheme);

    editor.updateOptions({
      fontSize: settings?.fontSize ?? 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      lineNumbers: settings?.lineNumbers !== false ? 'on' : 'off',
      minimap: { enabled: settings?.minimap !== false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: settings?.wordWrap !== false ? 'on' : 'off',
      tabSize: settings?.tabSize ?? 2,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      mouseWheelZoom: true,
      bracketPairColorization: { enabled: true },
      guides: { bracketPairs: true, indentation: true },
      renderLineHighlight: 'all',
      padding: { top: 8, bottom: 8 },
    });
  };

  const getLanguage = (fn: string): string => {
    const ext = fn.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      py: 'python', html: 'html', css: 'css', scss: 'scss', less: 'less',
      json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml', md: 'markdown',
      php: 'php', java: 'java', c: 'c', cpp: 'cpp', cs: 'csharp', go: 'go',
      rs: 'rust', rb: 'ruby', sh: 'shell', sql: 'sql', r: 'r', swift: 'swift',
      kt: 'kotlin', scala: 'scala', dart: 'dart', sol: 'sol', vue: 'html', svelte: 'html',
    };
    return map[ext || ''] || 'plaintext';
  };

  const detectedLanguage = fileName ? getLanguage(fileName) : language;

  return (
    <div className="h-full bg-editor-background">
      <Editor
        height="100%"
        language={detectedLanguage}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme={monacoTheme}
        options={{ selectOnLineNumbers: true, automaticLayout: true }}
        loading={
          <div className="h-full flex items-center justify-center bg-editor-background">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Loading editor...</span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
