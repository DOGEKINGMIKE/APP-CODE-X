import React, { useState, useCallback } from 'react';
import { Blocks, Type, Square, Layout, Image, ToggleLeft, List, Minus, GripVertical, Trash2, Copy, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BuilderComponent {
  id: string;
  type: string;
  label: string;
  props: Record<string, string>;
  children?: BuilderComponent[];
}

const COMPONENT_LIBRARY = [
  { type: 'heading', label: 'Heading', icon: Type, defaultProps: { text: 'Heading', level: 'h2' } },
  { type: 'paragraph', label: 'Text', icon: Type, defaultProps: { text: 'Lorem ipsum dolor sit amet.' } },
  { type: 'button', label: 'Button', icon: Square, defaultProps: { text: 'Click Me', variant: 'primary' } },
  { type: 'input', label: 'Input', icon: Minus, defaultProps: { placeholder: 'Enter text...', type: 'text' } },
  { type: 'image', label: 'Image', icon: Image, defaultProps: { src: 'https://placehold.co/400x200', alt: 'Image' } },
  { type: 'card', label: 'Card', icon: Square, defaultProps: { title: 'Card Title', body: 'Card content goes here.' } },
  { type: 'container', label: 'Container', icon: Layout, defaultProps: { direction: 'column', gap: '16', padding: '16' } },
  { type: 'divider', label: 'Divider', icon: Minus, defaultProps: {} },
  { type: 'list', label: 'List', icon: List, defaultProps: { items: 'Item 1,Item 2,Item 3' } },
  { type: 'toggle', label: 'Toggle', icon: ToggleLeft, defaultProps: { label: 'Toggle option', checked: 'false' } },
];

const NoCodeBuilder: React.FC = () => {
  const [canvas, setCanvas] = useState<BuilderComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const addComponent = useCallback((type: string) => {
    const def = COMPONENT_LIBRARY.find(c => c.type === type);
    if (!def) return;
    const comp: BuilderComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      label: def.label,
      props: { ...def.defaultProps },
    };
    setCanvas(prev => [...prev, comp]);
    setSelectedId(comp.id);
  }, []);

  const removeComponent = useCallback((id: string) => {
    setCanvas(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const duplicateComponent = useCallback((id: string) => {
    setCanvas(prev => {
      const comp = prev.find(c => c.id === id);
      if (!comp) return prev;
      const clone = { ...comp, id: `comp_${Date.now()}`, props: { ...comp.props } };
      const idx = prev.indexOf(comp);
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  }, []);

  const moveComponent = useCallback((id: string, dir: 'up' | 'down') => {
    setCanvas(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const updateProp = useCallback((id: string, key: string, value: string) => {
    setCanvas(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c));
  }, []);

  const selectedComp = canvas.find(c => c.id === selectedId);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData('component-type');
    if (type) addComponent(type);
  }, [addComponent]);

  const renderPreviewComponent = (comp: BuilderComponent) => {
    switch (comp.type) {
      case 'heading': {
        const Tag = (comp.props.level || 'h2') as keyof JSX.IntrinsicElements;
        return <Tag className="font-bold text-foreground" style={{ fontSize: comp.props.level === 'h1' ? 32 : comp.props.level === 'h3' ? 18 : 24 }}>{comp.props.text}</Tag>;
      }
      case 'paragraph': return <p className="text-sm text-foreground">{comp.props.text}</p>;
      case 'button': return (
        <button className={`px-4 py-2 rounded font-medium text-sm ${comp.props.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
          {comp.props.text}
        </button>
      );
      case 'input': return <input type={comp.props.type} placeholder={comp.props.placeholder} className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm" />;
      case 'image': return <img src={comp.props.src} alt={comp.props.alt} className="max-w-full rounded" />;
      case 'card': return (
        <div className="border border-border rounded-lg p-4 bg-card">
          <h3 className="font-semibold text-foreground mb-2">{comp.props.title}</h3>
          <p className="text-xs text-muted-foreground">{comp.props.body}</p>
        </div>
      );
      case 'container': return (
        <div className="border-2 border-dashed border-border rounded-lg min-h-[40px]" style={{
          display: 'flex', flexDirection: comp.props.direction === 'row' ? 'row' : 'column',
          gap: `${comp.props.gap}px`, padding: `${comp.props.padding}px`,
        }}>
          <span className="text-[10px] text-muted-foreground">Container</span>
        </div>
      );
      case 'divider': return <hr className="border-border" />;
      case 'list': return (
        <ul className="list-disc pl-5 space-y-1">
          {(comp.props.items || '').split(',').map((item, i) => <li key={i} className="text-sm text-foreground">{item.trim()}</li>)}
        </ul>
      );
      case 'toggle': return (
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <div className={`w-9 h-5 rounded-full relative ${comp.props.checked === 'true' ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${comp.props.checked === 'true' ? 'left-4' : 'left-0.5'}`} />
          </div>
          {comp.props.label}
        </label>
      );
      default: return <div className="text-xs text-muted-foreground">[{comp.type}]</div>;
    }
  };

  const generateHTML = useCallback(() => {
    const lines: string[] = ['<!DOCTYPE html>', '<html lang="en">', '<head>', '  <meta charset="UTF-8">', '  <meta name="viewport" content="width=device-width, initial-scale=1.0">', '  <title>No-Code Build</title>',
      '  <style>', '    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }',
      '    .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }',
      '    .btn-primary { background: #7c3aed; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }',
      '    .btn-secondary { background: #e5e7eb; color: #111; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }',
      '    input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }',
      '  </style>', '</head>', '<body>'];
    canvas.forEach(c => {
      switch (c.type) {
        case 'heading': lines.push(`  <${c.props.level || 'h2'}>${c.props.text}</${c.props.level || 'h2'}>`); break;
        case 'paragraph': lines.push(`  <p>${c.props.text}</p>`); break;
        case 'button': lines.push(`  <button class="btn-${c.props.variant || 'primary'}">${c.props.text}</button>`); break;
        case 'input': lines.push(`  <input type="${c.props.type}" placeholder="${c.props.placeholder}" />`); break;
        case 'image': lines.push(`  <img src="${c.props.src}" alt="${c.props.alt}" style="max-width:100%;border-radius:8px" />`); break;
        case 'card': lines.push(`  <div class="card"><h3>${c.props.title}</h3><p>${c.props.body}</p></div>`); break;
        case 'divider': lines.push('  <hr />'); break;
        case 'list': lines.push(`  <ul>${(c.props.items || '').split(',').map(i => `<li>${i.trim()}</li>`).join('')}</ul>`); break;
        default: break;
      }
    });
    lines.push('</body>', '</html>');
    return lines.join('\n');
  }, [canvas]);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Blocks className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">No-Code Builder</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{canvas.length} components</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Component Library */}
        <div className="w-48 border-r border-border overflow-y-auto p-2 space-y-1 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1 block">Components</span>
          {COMPONENT_LIBRARY.map(comp => (
            <button
              key={comp.type}
              draggable
              onDragStart={e => e.dataTransfer.setData('component-type', comp.type)}
              onClick={() => addComponent(comp.type)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-foreground hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
            >
              <comp.icon className="w-3.5 h-3.5 text-primary shrink-0" />
              {comp.label}
            </button>
          ))}

          {canvas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => {
                const html = generateHTML();
                navigator.clipboard.writeText(html);
              }}>
                Export HTML
              </Button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4" onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
          {canvas.length === 0 ? (
            <div className={`h-full flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="text-center">
                <Blocks className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Drag components here or click to add</p>
                <p className="text-[10px] text-muted-foreground mt-1">Build your layout visually</p>
              </div>
            </div>
          ) : (
            <div className={`space-y-2 min-h-full ${dragOver ? 'ring-2 ring-primary/30 rounded-lg' : ''}`}>
              {canvas.map((comp, i) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`relative group p-3 rounded-lg border transition-all cursor-pointer ${selectedId === comp.id ? 'border-primary ring-1 ring-primary/30' : 'border-transparent hover:border-border'}`}
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {selectedId === comp.id && (
                    <div className="absolute -top-2 right-1 flex items-center gap-0.5 bg-card border border-border rounded px-1 py-0.5 z-10">
                      <button onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'up'); }} className="p-0.5 hover:text-primary"><ChevronUp className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'down'); }} className="p-0.5 hover:text-primary"><ChevronDown className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); duplicateComponent(comp.id); }} className="p-0.5 hover:text-primary"><Copy className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); removeComponent(comp.id); }} className="p-0.5 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                  {renderPreviewComponent(comp)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {selectedComp && (
          <div className="w-56 border-l border-border overflow-y-auto p-3 space-y-3 shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Settings className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Properties</span>
            </div>
            <div className="text-xs font-medium text-foreground mb-2">{selectedComp.label}</div>
            {Object.entries(selectedComp.props).map(([key, value]) => (
              <div key={key}>
                <label className="text-[10px] text-muted-foreground capitalize block mb-1">{key}</label>
                {key === 'level' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground">
                    <option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option>
                  </select>
                ) : key === 'variant' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground">
                    <option value="primary">Primary</option><option value="secondary">Secondary</option>
                  </select>
                ) : key === 'direction' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground">
                    <option value="column">Column</option><option value="row">Row</option>
                  </select>
                ) : key === 'checked' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground">
                    <option value="false">Off</option><option value="true">On</option>
                  </select>
                ) : value.length > 50 ? (
                  <textarea value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground h-16 resize-none" />
                ) : (
                  <Input value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="h-7 text-xs" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoCodeBuilder;
