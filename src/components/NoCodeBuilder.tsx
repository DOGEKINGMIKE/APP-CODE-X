import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Blocks, Type, Square, Layout, Image, ToggleLeft, List, Minus, GripVertical, Trash2, Copy, Settings, ChevronDown, ChevronUp, Video, FormInput, Columns, SlidersHorizontal, Palette, Code, MousePointerClick, Layers, Eye, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface BuilderComponent {
  id: string;
  type: string;
  label: string;
  props: Record<string, string>;
  children?: BuilderComponent[];
}

interface NoCodeBuilderProps {
  onCodeSync?: (files: { name: string; content: string; action: string }[]) => void;
  projectFiles?: { name: string; content?: string }[];
}

const COMPONENT_LIBRARY = [
  { type: 'heading', label: 'Heading', icon: Type, category: 'Typography', defaultProps: { text: 'Heading', level: 'h2' } },
  { type: 'paragraph', label: 'Text', icon: Type, category: 'Typography', defaultProps: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' } },
  { type: 'button', label: 'Button', icon: Square, category: 'Interactive', defaultProps: { text: 'Click Me', variant: 'primary', animation: 'none' } },
  { type: 'input', label: 'Input', icon: Minus, category: 'Forms', defaultProps: { placeholder: 'Enter text...', type: 'text', label: 'Label' } },
  { type: 'textarea', label: 'Textarea', icon: FormInput, category: 'Forms', defaultProps: { placeholder: 'Enter details...', rows: '4', label: 'Description' } },
  { type: 'select', label: 'Select', icon: ChevronDown, category: 'Forms', defaultProps: { label: 'Choose option', options: 'Option 1,Option 2,Option 3' } },
  { type: 'checkbox', label: 'Checkbox', icon: ToggleLeft, category: 'Forms', defaultProps: { label: 'I agree to terms', checked: 'false' } },
  { type: 'image', label: 'Image', icon: Image, category: 'Media', defaultProps: { src: 'https://placehold.co/600x300', alt: 'Image', borderRadius: '8' } },
  { type: 'video', label: 'Video', icon: Video, category: 'Media', defaultProps: { src: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: 'false', controls: 'true' } },
  { type: 'card', label: 'Card', icon: Square, category: 'Layout', defaultProps: { title: 'Card Title', body: 'Card content goes here.', shadow: 'md' } },
  { type: 'container', label: 'Container', icon: Layout, category: 'Layout', defaultProps: { direction: 'column', gap: '16', padding: '16', background: 'transparent' } },
  { type: 'columns', label: 'Columns', icon: Columns, category: 'Layout', defaultProps: { count: '2', gap: '16' } },
  { type: 'modal', label: 'Modal', icon: Layers, category: 'Interactive', defaultProps: { title: 'Modal Title', body: 'Modal content here.', triggerText: 'Open Modal' } },
  { type: 'tabs', label: 'Tabs', icon: SlidersHorizontal, category: 'Interactive', defaultProps: { tabs: 'Tab 1,Tab 2,Tab 3', activeTab: '0' } },
  { type: 'divider', label: 'Divider', icon: Minus, category: 'Layout', defaultProps: { style: 'solid', color: '#444' } },
  { type: 'list', label: 'List', icon: List, category: 'Typography', defaultProps: { items: 'Item 1,Item 2,Item 3', style: 'disc' } },
  { type: 'toggle', label: 'Toggle', icon: ToggleLeft, category: 'Forms', defaultProps: { label: 'Toggle option', checked: 'false' } },
  { type: 'badge', label: 'Badge', icon: MousePointerClick, category: 'Typography', defaultProps: { text: 'New', variant: 'primary' } },
  { type: 'progress', label: 'Progress', icon: SlidersHorizontal, category: 'Interactive', defaultProps: { value: '65', max: '100', color: 'primary' } },
  { type: 'spacer', label: 'Spacer', icon: Minus, category: 'Layout', defaultProps: { height: '32' } },
];

const CATEGORIES = ['Typography', 'Layout', 'Forms', 'Interactive', 'Media'];
const ANIMATIONS = ['none', 'fadeIn', 'slideUp', 'slideLeft', 'bounce', 'pulse', 'scale'];

// Parse HTML back into canvas components (two-way sync)
const parseHTMLToCanvas = (html: string): BuilderComponent[] => {
  const components: BuilderComponent[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const appDiv = doc.querySelector('.app') || doc.body;

  const children = Array.from(appDiv.children);
  children.forEach((el, i) => {
    const id = `comp_parsed_${i}_${Date.now()}`;
    const tag = el.tagName.toLowerCase();
    const cls = el.className || '';
    const animMatch = cls.match(/animate-(\w+)/);
    const animation = animMatch ? animMatch[1] : 'none';

    if (['h1', 'h2', 'h3'].includes(tag)) {
      components.push({ id, type: 'heading', label: 'Heading', props: { text: el.textContent || '', level: tag, animation } });
    } else if (tag === 'p' && !el.closest('.card') && !el.closest('dialog')) {
      components.push({ id, type: 'paragraph', label: 'Text', props: { text: el.textContent || '', animation } });
    } else if (tag === 'button' && cls.includes('btn-')) {
      const variant = cls.includes('btn-secondary') ? 'secondary' : cls.includes('btn-outline') ? 'outline' : 'primary';
      if (!el.getAttribute('onclick')?.includes('showModal')) {
        components.push({ id, type: 'button', label: 'Button', props: { text: el.textContent || '', variant, animation } });
      }
    } else if (tag === 'div' && cls.includes('form-group')) {
      const inp = el.querySelector('input');
      const ta = el.querySelector('textarea');
      const sel = el.querySelector('select');
      const lbl = el.querySelector('label')?.textContent || '';
      if (ta) {
        components.push({ id, type: 'textarea', label: 'Textarea', props: { placeholder: ta.getAttribute('placeholder') || '', rows: ta.getAttribute('rows') || '4', label: lbl, animation } });
      } else if (sel) {
        const opts = Array.from(sel.querySelectorAll('option')).map(o => o.textContent).join(',');
        components.push({ id, type: 'select', label: 'Select', props: { label: lbl, options: opts, animation } });
      } else if (inp) {
        components.push({ id, type: 'input', label: 'Input', props: { placeholder: inp.getAttribute('placeholder') || '', type: inp.getAttribute('type') || 'text', label: lbl, animation } });
      }
    } else if (tag === 'label' && cls.includes('checkbox-label')) {
      const checked = el.querySelector('input')?.hasAttribute('checked') ? 'true' : 'false';
      components.push({ id, type: 'checkbox', label: 'Checkbox', props: { label: el.textContent?.trim() || '', checked, animation } });
    } else if (tag === 'img') {
      const style = (el as HTMLElement).getAttribute('style') || '';
      const brMatch = style.match(/border-radius:\s*(\d+)/);
      components.push({ id, type: 'image', label: 'Image', props: { src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '', borderRadius: brMatch?.[1] || '0', animation } });
    } else if (tag === 'video') {
      components.push({ id, type: 'video', label: 'Video', props: { src: el.getAttribute('src') || '', controls: el.hasAttribute('controls') ? 'true' : 'false', autoplay: el.hasAttribute('autoplay') ? 'true' : 'false', animation } });
    } else if (tag === 'div' && cls.includes('card')) {
      const title = el.querySelector('h3')?.textContent || '';
      const body = el.querySelector('p')?.textContent || '';
      components.push({ id, type: 'card', label: 'Card', props: { title, body, shadow: 'md', animation } });
    } else if (tag === 'div' && cls.includes('grid-cols')) {
      const cols = el.children.length;
      components.push({ id, type: 'columns', label: 'Columns', props: { count: String(cols), gap: '16', animation } });
    } else if (tag === 'hr') {
      const style = (el as HTMLElement).getAttribute('style') || '';
      const colorMatch = style.match(/border-color:\s*([^;]+)/);
      const styleMatch = style.match(/border-style:\s*([^;]+)/);
      components.push({ id, type: 'divider', label: 'Divider', props: { color: colorMatch?.[1] || '#444', style: styleMatch?.[1] || 'solid' } });
    } else if (tag === 'ul') {
      const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent).join(',');
      const listStyle = (el as HTMLElement).style.listStyleType || 'disc';
      components.push({ id, type: 'list', label: 'List', props: { items, style: listStyle, animation } });
    } else if (tag === 'span' && cls.includes('badge')) {
      const variant = cls.includes('badge-secondary') ? 'secondary' : cls.includes('badge-destructive') ? 'destructive' : 'primary';
      components.push({ id, type: 'badge', label: 'Badge', props: { text: el.textContent || '', variant, animation } });
    } else if (tag === 'div' && cls.includes('progress-container')) {
      const bar = el.querySelector('.progress-bar') as HTMLElement;
      const width = bar?.style.width || '65%';
      components.push({ id, type: 'progress', label: 'Progress', props: { value: String(Math.round(parseFloat(width))), max: '100', animation } });
    } else if (tag === 'div' && (el as HTMLElement).style.height) {
      components.push({ id, type: 'spacer', label: 'Spacer', props: { height: String(parseInt((el as HTMLElement).style.height) || 32) } });
    } else if (tag === 'div' && cls.includes('tabs-container')) {
      const tabEls = el.querySelectorAll('.tab');
      const tabs = Array.from(tabEls).map(t => t.textContent?.trim()).join(',');
      const activeIdx = Array.from(tabEls).findIndex(t => t.classList.contains('active'));
      components.push({ id, type: 'tabs', label: 'Tabs', props: { tabs, activeTab: String(Math.max(0, activeIdx)), animation } });
    }
  });

  return components;
};

const NoCodeBuilder: React.FC<NoCodeBuilderProps> = ({ onCodeSync, projectFiles }) => {
  const [canvas, setCanvas] = useState<BuilderComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCSSEditor, setShowCSSEditor] = useState(false);
  const [customCSS, setCustomCSS] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const lastSyncedHTML = useRef<string>('');
  const isInternalSync = useRef(false);

  // Two-way sync: parse HTML from project files when they change externally
  useEffect(() => {
    if (!projectFiles || isInternalSync.current) {
      isInternalSync.current = false;
      return;
    }
    const htmlFile = projectFiles.find(f => f.name === 'index.html');
    if (!htmlFile?.content) return;
    // Only re-parse if the HTML actually changed from what we last generated
    if (htmlFile.content === lastSyncedHTML.current) return;
    const parsed = parseHTMLToCanvas(htmlFile.content);
    if (parsed.length > 0) {
      setCanvas(parsed);
    }
  }, [projectFiles]);

  // Generate HTML from canvas
  const generateHTML = useCallback((currentCanvas: BuilderComponent[], css: string) => {
    const bodyLines: string[] = [];

    currentCanvas.forEach(c => {
      const anim = c.props.animation && c.props.animation !== 'none' ? ` class="animate-${c.props.animation}"` : '';
      switch (c.type) {
        case 'heading': bodyLines.push(`    <${c.props.level || 'h2'}${anim}>${c.props.text}</${c.props.level || 'h2'}>`); break;
        case 'paragraph': bodyLines.push(`    <p${anim}>${c.props.text}</p>`); break;
        case 'button': bodyLines.push(`    <button class="btn-${c.props.variant || 'primary'}${anim ? ' ' + anim.replace(' class="', '').replace('"', '') : ''}">${c.props.text}</button>`); break;
        case 'input': bodyLines.push(`    <div class="form-group">\n      ${c.props.label ? `<label>${c.props.label}</label>\n      ` : ''}<input type="${c.props.type}" placeholder="${c.props.placeholder}" />\n    </div>`); break;
        case 'textarea': bodyLines.push(`    <div class="form-group">\n      ${c.props.label ? `<label>${c.props.label}</label>\n      ` : ''}<textarea placeholder="${c.props.placeholder}" rows="${c.props.rows}"></textarea>\n    </div>`); break;
        case 'select': bodyLines.push(`    <div class="form-group">\n      ${c.props.label ? `<label>${c.props.label}</label>\n      ` : ''}<select>\n${(c.props.options || '').split(',').map(o => `        <option>${o.trim()}</option>`).join('\n')}\n      </select>\n    </div>`); break;
        case 'checkbox': bodyLines.push(`    <label class="checkbox-label">\n      <input type="checkbox"${c.props.checked === 'true' ? ' checked' : ''} />\n      ${c.props.label}\n    </label>`); break;
        case 'image': bodyLines.push(`    <img src="${c.props.src}" alt="${c.props.alt}" style="max-width:100%;border-radius:${c.props.borderRadius || 0}px" />`); break;
        case 'video': bodyLines.push(`    <video src="${c.props.src}" ${c.props.controls === 'true' ? 'controls' : ''} ${c.props.autoplay === 'true' ? 'autoplay muted' : ''} style="max-width:100%;border-radius:8px"></video>`); break;
        case 'card': bodyLines.push(`    <div class="card">\n      <h3>${c.props.title}</h3>\n      <p>${c.props.body}</p>\n    </div>`); break;
        case 'container': bodyLines.push(`    <div class="container-box" style="flex-direction:${c.props.direction};gap:${c.props.gap}px;padding:${c.props.padding}px;${c.props.background !== 'transparent' ? `background:${c.props.background}` : ''}">\n      <!-- Container content -->\n    </div>`); break;
        case 'columns': bodyLines.push(`    <div class="grid-cols" style="grid-template-columns:repeat(${c.props.count},1fr);gap:${c.props.gap}px">\n${Array.from({ length: parseInt(c.props.count || '2') }).map((_, i) => `      <div class="grid-col">\n        <p>Column ${i + 1}</p>\n      </div>`).join('\n')}\n    </div>`); break;
        case 'modal': bodyLines.push(`    <button class="btn-primary" onclick="document.getElementById('modal-${c.id}').showModal()">${c.props.triggerText}</button>\n    <dialog id="modal-${c.id}" class="modal">\n      <h3>${c.props.title}</h3>\n      <p>${c.props.body}</p>\n      <button class="btn-secondary" onclick="this.closest('dialog').close()">Close</button>\n    </dialog>`); break;
        case 'tabs': {
          const tabs = (c.props.tabs || '').split(',');
          bodyLines.push(`    <div class="tabs-container">\n      <div class="tabs-header">\n${tabs.map((t, i) => `        <button class="tab${i === parseInt(c.props.activeTab || '0') ? ' active' : ''}" onclick="switchTab(this, '${c.id}', ${i})">${t.trim()}</button>`).join('\n')}\n      </div>\n      <div class="tabs-content" id="tabs-${c.id}">\n${tabs.map((t, i) => `        <div class="tab-panel${i === parseInt(c.props.activeTab || '0') ? ' active' : ''}">${t.trim()} content</div>`).join('\n')}\n      </div>\n    </div>`);
          break;
        }
        case 'divider': bodyLines.push(`    <hr style="border-color:${c.props.color};border-style:${c.props.style}" />`); break;
        case 'list': bodyLines.push(`    <ul style="list-style:${c.props.style};padding-left:20px">\n${(c.props.items || '').split(',').map(i => `      <li>${i.trim()}</li>`).join('\n')}\n    </ul>`); break;
        case 'toggle': bodyLines.push(`    <label class="toggle-label">\n      <input type="checkbox" class="toggle-input"${c.props.checked === 'true' ? ' checked' : ''} />\n      <span class="toggle-switch"></span>\n      ${c.props.label}\n    </label>`); break;
        case 'badge': bodyLines.push(`    <span class="badge badge-${c.props.variant || 'primary'}">${c.props.text}</span>`); break;
        case 'progress': bodyLines.push(`    <div class="progress-container">\n      <div class="progress-bar" style="width:${(parseInt(c.props.value) / parseInt(c.props.max)) * 100}%"></div>\n    </div>\n    <span class="progress-label">${c.props.value}/${c.props.max}</span>`); break;
        case 'spacer': bodyLines.push(`    <div style="height:${c.props.height}px"></div>`); break;
        default: break;
      }
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No-Code Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app">
${bodyLines.join('\n\n')}
  </div>
  <script src="script.js"><\/script>
</body>
</html>`;

    const cssContent = `/* === No-Code Builder Generated Styles === */
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #0f1117;
  color: #e1e4eb;
  line-height: 1.6;
}

.app { display: flex; flex-direction: column; gap: 16px; }

h1 { font-size: 2rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
h3 { font-size: 1.15rem; font-weight: 600; }
p { font-size: 0.9rem; color: #b0b4bd; }

.btn-primary {
  background: #7c3aed; color: white;
  padding: 10px 20px; border: none; border-radius: 8px;
  cursor: pointer; font-weight: 500; font-size: 14px;
  transition: all 0.2s;
}
.btn-primary:hover { opacity: 0.9; transform: scale(0.98); }
.btn-secondary {
  background: #2a2d35; color: #e1e4eb;
  padding: 10px 20px; border: none; border-radius: 8px;
  cursor: pointer; font-size: 14px;
}
.btn-outline {
  background: transparent; color: #e1e4eb;
  padding: 10px 20px; border: 1px solid #2a2d35;
  border-radius: 8px; cursor: pointer; font-size: 14px;
}

.form-group { display: flex; flex-direction: column; gap: 4px; }
label { font-size: 12px; color: #888; }
input, textarea, select {
  width: 100%; padding: 10px 14px;
  border: 1px solid #2a2d35; border-radius: 8px;
  background: #1a1d27; color: #e1e4eb; font-size: 14px;
  outline: none; transition: border-color 0.2s;
}
input:focus, textarea:focus, select:focus { border-color: #7c3aed; }
textarea { resize: vertical; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.toggle-label { display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer; }
.toggle-input { display: none; }
.toggle-switch {
  width: 36px; height: 20px; border-radius: 10px;
  background: #2a2d35; position: relative; transition: background 0.2s;
}
.toggle-switch::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: white; transition: transform 0.2s;
}
.toggle-input:checked + .toggle-switch { background: #7c3aed; }
.toggle-input:checked + .toggle-switch::after { transform: translateX(16px); }

.card {
  border: 1px solid #2a2d35; border-radius: 12px;
  padding: 20px; background: #161820;
}
.card h3 { margin-bottom: 8px; }

.container-box {
  display: flex; border: 2px dashed #2a2d35;
  border-radius: 12px; min-height: 40px;
}
.grid-cols { display: grid; }
.grid-col {
  border: 1px dashed #2a2d35; border-radius: 8px;
  padding: 16px; min-height: 60px;
}

.badge {
  display: inline-block; padding: 2px 10px;
  border-radius: 999px; font-size: 11px; font-weight: 500;
}
.badge-primary { background: #7c3aed; color: white; }
.badge-secondary { background: #2a2d35; color: #e1e4eb; }
.badge-destructive { background: #ef4444; color: white; }

.progress-container {
  width: 100%; height: 8px; border-radius: 999px;
  background: #2a2d35; overflow: hidden;
}
.progress-bar {
  height: 100%; border-radius: 999px;
  background: #7c3aed; transition: width 0.3s;
}
.progress-label { font-size: 11px; color: #888; margin-top: 4px; display: block; }

.tabs-container { width: 100%; }
.tabs-header { display: flex; border-bottom: 1px solid #2a2d35; margin-bottom: 12px; }
.tab {
  padding: 8px 16px; font-size: 13px; cursor: pointer;
  color: #888; border: none; background: none;
  border-bottom: 2px solid transparent; transition: all 0.2s;
}
.tab.active { color: #7c3aed; border-bottom-color: #7c3aed; }
.tab:hover { color: #e1e4eb; }
.tab-panel { display: none; padding: 8px; font-size: 14px; color: #b0b4bd; }
.tab-panel.active { display: block; }

dialog.modal {
  background: #161820; color: #e1e4eb; border: 1px solid #2a2d35;
  border-radius: 12px; padding: 24px; max-width: 480px; width: 90%;
}
dialog.modal::backdrop { background: rgba(0,0,0,0.6); }
dialog.modal h3 { margin-bottom: 12px; }
dialog.modal p { margin-bottom: 16px; color: #b0b4bd; font-size: 14px; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scale { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
.animate-slideUp { animation: slideUp 0.4s ease-out; }
.animate-slideLeft { animation: slideLeft 0.4s ease-out; }
.animate-bounce { animation: bounce 1s infinite; }
.animate-pulse { animation: pulse 2s infinite; }
.animate-scale { animation: scale 0.3s ease-out; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

${css}`;

    const hasModals = currentCanvas.some(c => c.type === 'modal');
    const hasTabs = currentCanvas.some(c => c.type === 'tabs');
    const hasToggles = currentCanvas.some(c => c.type === 'toggle');

    let jsContent = `// === No-Code Builder Generated JavaScript ===\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('No-Code project loaded!');\n`;

    if (hasTabs) {
      jsContent += `\n  window.switchTab = function(btn, tabsId, index) {\n    const container = btn.closest('.tabs-container');\n    container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));\n    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));\n    btn.classList.add('active');\n    container.querySelectorAll('.tab-panel')[index]?.classList.add('active');\n  };\n`;
    }
    if (hasToggles) {
      jsContent += `\n  document.querySelectorAll('.toggle-input').forEach(input => {\n    input.addEventListener('change', () => console.log('Toggle:', input.checked));\n  });\n`;
    }
    if (hasModals) {
      jsContent += `\n  document.querySelectorAll('dialog.modal').forEach(dialog => {\n    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });\n  });\n`;
    }

    jsContent += `});\n`;

    return { html: htmlContent, css: cssContent, js: jsContent };
  }, []);

  // Sync code to project files whenever canvas or CSS changes (debounced)
  useEffect(() => {
    if (!onCodeSync || canvas.length === 0) return;

    const syncTimer = setTimeout(() => {
      isInternalSync.current = true;
      const { html, css, js } = generateHTML(canvas, customCSS);
      lastSyncedHTML.current = html;
      onCodeSync([
        { name: 'index.html', content: html, action: 'update' },
        { name: 'style.css', content: css, action: 'update' },
        { name: 'script.js', content: js, action: 'update' },
      ]);
    }, 500);

    return () => clearTimeout(syncTimer);
  }, [canvas, customCSS, onCodeSync, generateHTML]);

  const addComponent = useCallback((type: string) => {
    const def = COMPONENT_LIBRARY.find(c => c.type === type);
    if (!def) return;
    const comp: BuilderComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type, label: def.label,
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

  const getAnimationClass = (animation?: string) => {
    switch (animation) {
      case 'fadeIn': return 'animate-[fadeIn_0.5s_ease-in-out]';
      case 'slideUp': return 'animate-[slideUp_0.4s_ease-out]';
      case 'slideLeft': return 'animate-[slideLeft_0.4s_ease-out]';
      case 'bounce': return 'animate-bounce';
      case 'pulse': return 'animate-pulse';
      case 'scale': return 'animate-[scale_0.3s_ease-out]';
      default: return '';
    }
  };

  const renderPreviewComponent = (comp: BuilderComponent) => {
    const anim = getAnimationClass(comp.props.animation);
    switch (comp.type) {
      case 'heading': {
        const Tag = (comp.props.level || 'h2') as keyof JSX.IntrinsicElements;
        return <Tag className={`font-bold text-foreground ${anim}`} style={{ fontSize: comp.props.level === 'h1' ? 32 : comp.props.level === 'h3' ? 18 : 24 }}>{comp.props.text}</Tag>;
      }
      case 'paragraph': return <p className={`text-sm text-foreground ${anim}`}>{comp.props.text}</p>;
      case 'button': return (
        <button className={`px-4 py-2 rounded font-medium text-sm transition-all hover:opacity-90 active:scale-95 ${anim} ${comp.props.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : comp.props.variant === 'outline' ? 'border border-border text-foreground bg-transparent' : 'bg-primary text-primary-foreground'}`}>
          {comp.props.text}
        </button>
      );
      case 'input': return (
        <div className={anim}>
          {comp.props.label && <label className="text-xs text-muted-foreground mb-1 block">{comp.props.label}</label>}
          <input type={comp.props.type} placeholder={comp.props.placeholder} className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm" />
        </div>
      );
      case 'textarea': return (
        <div className={anim}>
          {comp.props.label && <label className="text-xs text-muted-foreground mb-1 block">{comp.props.label}</label>}
          <textarea placeholder={comp.props.placeholder} rows={parseInt(comp.props.rows || '3')} className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm resize-none" />
        </div>
      );
      case 'select': return (
        <div className={anim}>
          {comp.props.label && <label className="text-xs text-muted-foreground mb-1 block">{comp.props.label}</label>}
          <select className="w-full px-3 py-2 rounded border border-border bg-input text-foreground text-sm">
            {(comp.props.options || '').split(',').map((opt, i) => <option key={i}>{opt.trim()}</option>)}
          </select>
        </div>
      );
      case 'checkbox': return (
        <label className={`flex items-center gap-2 text-sm text-foreground cursor-pointer ${anim}`}>
          <input type="checkbox" defaultChecked={comp.props.checked === 'true'} className="rounded border-border" />
          {comp.props.label}
        </label>
      );
      case 'image': return <img src={comp.props.src} alt={comp.props.alt} className={`max-w-full ${anim}`} style={{ borderRadius: `${comp.props.borderRadius || 0}px` }} />;
      case 'video': return (
        <video src={comp.props.src} controls={comp.props.controls === 'true'} autoPlay={comp.props.autoplay === 'true'} className={`max-w-full rounded ${anim}`} />
      );
      case 'card': return (
        <div className={`border border-border rounded-lg p-4 bg-card ${anim}`} style={{ boxShadow: comp.props.shadow === 'lg' ? '0 10px 25px -5px rgba(0,0,0,0.3)' : comp.props.shadow === 'md' ? '0 4px 12px -2px rgba(0,0,0,0.2)' : 'none' }}>
          <h3 className="font-semibold text-foreground mb-2">{comp.props.title}</h3>
          <p className="text-xs text-muted-foreground">{comp.props.body}</p>
        </div>
      );
      case 'container': return (
        <div className={`border-2 border-dashed border-border rounded-lg min-h-[40px] ${anim}`} style={{
          display: 'flex', flexDirection: comp.props.direction === 'row' ? 'row' : 'column',
          gap: `${comp.props.gap}px`, padding: `${comp.props.padding}px`,
          background: comp.props.background !== 'transparent' ? comp.props.background : undefined,
        }}>
          <span className="text-[10px] text-muted-foreground">Container</span>
        </div>
      );
      case 'columns': return (
        <div className={anim} style={{ display: 'grid', gridTemplateColumns: `repeat(${comp.props.count}, 1fr)`, gap: `${comp.props.gap}px` }}>
          {Array.from({ length: parseInt(comp.props.count || '2') }).map((_, i) => (
            <div key={i} className="border border-dashed border-border rounded-lg p-3 min-h-[60px] flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground">Col {i + 1}</span>
            </div>
          ))}
        </div>
      );
      case 'modal': return (
        <div className={anim}>
          <button className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm">{comp.props.triggerText}</button>
          <div className="mt-2 border border-border rounded-lg p-3 bg-card/80 text-xs">
            <div className="font-medium text-foreground mb-1">{comp.props.title}</div>
            <p className="text-muted-foreground">{comp.props.body}</p>
          </div>
        </div>
      );
      case 'tabs': return (
        <div className={anim}>
          <div className="flex border-b border-border mb-2">
            {(comp.props.tabs || '').split(',').map((tab, i) => (
              <button key={i} className={`px-3 py-1.5 text-xs transition-colors ${i === parseInt(comp.props.activeTab || '0') ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab.trim()}
              </button>
            ))}
          </div>
          <div className="p-2 text-xs text-muted-foreground">Tab content area</div>
        </div>
      );
      case 'divider': return <hr style={{ borderColor: comp.props.color, borderStyle: comp.props.style as any }} />;
      case 'list': return (
        <ul className={`pl-5 space-y-1 ${anim}`} style={{ listStyleType: comp.props.style || 'disc' }}>
          {(comp.props.items || '').split(',').map((item, i) => <li key={i} className="text-sm text-foreground">{item.trim()}</li>)}
        </ul>
      );
      case 'toggle': return (
        <label className={`flex items-center gap-2 text-sm text-foreground cursor-pointer ${anim}`}>
          <div className={`w-9 h-5 rounded-full relative transition-colors ${comp.props.checked === 'true' ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${comp.props.checked === 'true' ? 'left-4' : 'left-0.5'}`} />
          </div>
          {comp.props.label}
        </label>
      );
      case 'badge': return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${anim} ${comp.props.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : comp.props.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
          {comp.props.text}
        </span>
      );
      case 'progress': return (
        <div className={`w-full ${anim}`}>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (parseInt(comp.props.value) / parseInt(comp.props.max)) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">{comp.props.value}/{comp.props.max}</span>
        </div>
      );
      case 'spacer': return <div style={{ height: `${comp.props.height}px` }} />;
      default: return <div className="text-xs text-muted-foreground">[{comp.type}]</div>;
    }
  };

  const filteredComponents = activeCategory
    ? COMPONENT_LIBRARY.filter(c => c.category === activeCategory)
    : COMPONENT_LIBRARY;

  const handleExportHTML = useCallback(() => {
    const { html } = generateHTML(canvas, customCSS);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'project.html'; a.click();
    URL.revokeObjectURL(url);
  }, [canvas, customCSS, generateHTML]);

  const handleCopyHTML = useCallback(() => {
    const { html } = generateHTML(canvas, customCSS);
    navigator.clipboard.writeText(html);
    toast.success('HTML copied to clipboard!');
  }, [canvas, customCSS, generateHTML]);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-10 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Blocks className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground">No-Code Builder</span>
        {onCodeSync && canvas.length > 0 && (
          <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">⟳ LIVE SYNC</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setPreviewMode(!previewMode)} className={`p-1.5 rounded transition-colors ${previewMode ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`} title="Preview">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowCSSEditor(!showCSSEditor)} className={`p-1.5 rounded transition-colors ${showCSSEditor ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`} title="CSS Editor">
            <Palette className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground ml-1">{canvas.length}</span>
        </div>
      </div>

      {showCSSEditor && (
        <div className="border-b border-border p-2 bg-muted/20 shrink-0">
          <div className="flex items-center gap-1 mb-1">
            <Code className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-foreground">Custom CSS</span>
          </div>
          <textarea
            value={customCSS}
            onChange={e => setCustomCSS(e.target.value)}
            placeholder=".my-class { color: red; }"
            className="w-full h-20 bg-input border border-border rounded px-2 py-1.5 text-[11px] text-foreground font-mono resize-none focus:border-primary focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Component Library - responsive width */}
        <div className="w-36 sm:w-44 border-r border-border overflow-y-auto shrink-0">
          <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-border">
            <button onClick={() => setActiveCategory(null)} className={`px-1.5 py-1 rounded text-[10px] font-medium transition-colors min-h-[28px] ${!activeCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground bg-muted/50'}`}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`px-1.5 py-1 rounded text-[10px] font-medium transition-colors min-h-[28px] ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground bg-muted/50'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="p-1.5 space-y-0.5">
            {filteredComponents.map(comp => (
              <button
                key={comp.type}
                draggable
                onDragStart={e => e.dataTransfer.setData('component-type', comp.type)}
                onClick={() => addComponent(comp.type)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs text-foreground hover:bg-muted transition-colors cursor-grab active:cursor-grabbing min-h-[36px]"
              >
                <comp.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{comp.label}</span>
              </button>
            ))}
          </div>

          {canvas.length > 0 && (
            <div className="p-2 border-t border-border space-y-1">
              <Button variant="outline" size="sm" className="w-full text-[10px] h-8" onClick={handleCopyHTML}>
                <Code className="w-3 h-3 mr-1" /> Copy HTML
              </Button>
              <Button variant="outline" size="sm" className="w-full text-[10px] h-8" onClick={handleExportHTML}>
                <Download className="w-3 h-3 mr-1" /> Export HTML
              </Button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
          {canvas.length === 0 ? (
            <div className={`h-full flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="text-center p-4">
                <Blocks className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Drag components here or click to add</p>
                <p className="text-[10px] text-muted-foreground mt-1">Changes sync live to your code editor & preview</p>
              </div>
            </div>
          ) : (
            <div className={`space-y-2 min-h-full ${dragOver ? 'ring-2 ring-primary/30 rounded-lg' : ''}`}>
              {customCSS && <style>{customCSS}</style>}
              {canvas.map(comp => (
                <div
                  key={comp.id}
                  onClick={() => !previewMode && setSelectedId(comp.id)}
                  className={`relative group p-3 rounded-lg border transition-all ${previewMode ? 'border-transparent' : selectedId === comp.id ? 'border-primary ring-1 ring-primary/30' : 'border-transparent hover:border-border cursor-pointer'}`}
                >
                  {!previewMode && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  {!previewMode && selectedId === comp.id && (
                    <div className="absolute -top-2 right-1 flex items-center gap-0.5 bg-card border border-border rounded px-1 py-0.5 z-10">
                      <button onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'up'); }} className="p-1 hover:text-primary min-h-[24px] min-w-[24px] flex items-center justify-center"><ChevronUp className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'down'); }} className="p-1 hover:text-primary min-h-[24px] min-w-[24px] flex items-center justify-center"><ChevronDown className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); duplicateComponent(comp.id); }} className="p-1 hover:text-primary min-h-[24px] min-w-[24px] flex items-center justify-center"><Copy className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); removeComponent(comp.id); }} className="p-1 hover:text-destructive min-h-[24px] min-w-[24px] flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                  {renderPreviewComponent(comp)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {selectedComp && !previewMode && (
          <div className="w-48 sm:w-56 border-l border-border overflow-y-auto p-3 space-y-2.5 shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Settings className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Properties</span>
            </div>
            <div className="text-xs font-medium text-foreground mb-2">{selectedComp.label}</div>

            {/* Animation selector */}
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Animation</label>
              <select value={selectedComp.props.animation || 'none'} onChange={e => updateProp(selectedComp.id, 'animation', e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                {ANIMATIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {Object.entries(selectedComp.props).filter(([key]) => key !== 'animation').map(([key, value]) => (
              <div key={key}>
                <label className="text-[10px] text-muted-foreground capitalize block mb-1">{key}</label>
                {key === 'level' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option>
                  </select>
                ) : key === 'variant' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option><option value="destructive">Destructive</option>
                  </select>
                ) : key === 'direction' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="column">Column</option><option value="row">Row</option>
                  </select>
                ) : key === 'checked' || key === 'controls' || key === 'autoplay' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="false">Off</option><option value="true">On</option>
                  </select>
                ) : key === 'shadow' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="none">None</option><option value="md">Medium</option><option value="lg">Large</option>
                  </select>
                ) : key === 'style' && selectedComp.type === 'list' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="disc">Disc</option><option value="decimal">Numbered</option><option value="none">None</option>
                  </select>
                ) : key === 'style' && selectedComp.type === 'divider' ? (
                  <select value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground min-h-[32px]">
                    <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option>
                  </select>
                ) : value.length > 50 ? (
                  <textarea value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground h-16 resize-none focus:border-primary focus:outline-none" />
                ) : (
                  <Input value={value} onChange={e => updateProp(selectedComp.id, key, e.target.value)} className="h-8 text-xs" />
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
