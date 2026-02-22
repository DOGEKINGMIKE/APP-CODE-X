import React from 'react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import {
  FileText, Download, Trash2, Palette, Terminal, Eye, Bot,
  Plus, Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: string, payload?: any) => void;
  files: { id: string; name: string }[];
  themes: { id: string; name: string }[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange, onAction, files, themes }) => {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search files..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Files">
          {files.map(f => (
            <CommandItem key={f.id} onSelect={() => { onAction('openFile', f.id); onOpenChange(false); }}>
              <FileText className="mr-2 h-4 w-4" />{f.name}
            </CommandItem>
          ))}
          <CommandItem onSelect={() => { onAction('newFile'); onOpenChange(false); }}>
            <Plus className="mr-2 h-4 w-4" />New File
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Panels">
          <CommandItem onSelect={() => { onAction('togglePreview'); onOpenChange(false); }}>
            <Eye className="mr-2 h-4 w-4" />Toggle Preview
          </CommandItem>
          <CommandItem onSelect={() => { onAction('toggleAI'); onOpenChange(false); }}>
            <Bot className="mr-2 h-4 w-4" />Toggle AI Chat
          </CommandItem>
          <CommandItem onSelect={() => { onAction('toggleNova'); onOpenChange(false); }}>
            <Sparkles className="mr-2 h-4 w-4" />Toggle NOVA AI
          </CommandItem>
          <CommandItem onSelect={() => { onAction('toggleTerminal'); onOpenChange(false); }}>
            <Terminal className="mr-2 h-4 w-4" />Toggle Terminal
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { onAction('downloadZip'); onOpenChange(false); }}>
            <Download className="mr-2 h-4 w-4" />Export as ZIP
          </CommandItem>
          <CommandItem onSelect={() => { onAction('deleteAll'); onOpenChange(false); }}>
            <Trash2 className="mr-2 h-4 w-4" />Delete All Files
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Themes">
          {themes.map(t => (
            <CommandItem key={t.id} onSelect={() => { onAction('setTheme', t.id); onOpenChange(false); }}>
              <Palette className="mr-2 h-4 w-4" />{t.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
