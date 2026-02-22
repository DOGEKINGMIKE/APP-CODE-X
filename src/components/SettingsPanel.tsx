import React from 'react';
import { Settings, X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
}

interface SettingsPanelProps {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  onClose: () => void;
}

const shortcuts = [
  { keys: 'Ctrl+K', action: 'Command palette' },
  { keys: 'Ctrl+B', action: 'Toggle sidebar' },
  { keys: 'Ctrl+`', action: 'Toggle terminal' },
  { keys: 'Ctrl+F', action: 'Find' },
  { keys: 'Ctrl+H', action: 'Find & replace' },
  { keys: 'Ctrl+S', action: 'Export ZIP' },
  { keys: 'Ctrl+W', action: 'Close tab' },
  { keys: 'Ctrl+,', action: 'Settings' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onClose }) => {
  const update = (key: keyof EditorSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="h-full flex flex-col bg-explorer-background">
      <div className="h-9 bg-card border-b border-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Settings</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Editor</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-xs mb-2 block">Font Size: {settings.fontSize}px</Label>
              <Slider value={[settings.fontSize]} onValueChange={([v]) => update('fontSize', v)} min={10} max={24} step={1} />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Tab Size: {settings.tabSize}</Label>
              <Slider value={[settings.tabSize]} onValueChange={([v]) => update('tabSize', v)} min={1} max={8} step={1} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Word Wrap</Label>
              <Switch checked={settings.wordWrap} onCheckedChange={v => update('wordWrap', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Minimap</Label>
              <Switch checked={settings.minimap} onCheckedChange={v => update('minimap', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Line Numbers</Label>
              <Switch checked={settings.lineNumbers} onCheckedChange={v => update('lineNumbers', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Auto Save</Label>
              <Switch checked={settings.autoSave} onCheckedChange={v => update('autoSave', v)} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</h3>
          </div>
          <div className="space-y-1.5">
            {shortcuts.map(s => (
              <div key={s.keys} className="flex items-center justify-between py-1">
                <span className="text-xs text-muted-foreground">{s.action}</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono text-foreground">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
