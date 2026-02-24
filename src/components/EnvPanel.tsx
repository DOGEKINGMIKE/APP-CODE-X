import React, { useState, useCallback, useEffect } from 'react';
import { KeyRound, Plus, Trash2, Eye, EyeOff, Shield, Copy, Save, AlertTriangle, Upload, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

interface EnvPanelProps {
  userId?: string;
  onEnvChange?: (envVars: Record<string, string>) => void;
}

const STORAGE_KEY = 'x11-env-vars';

const ENV_PRESETS: { name: string; vars: { key: string; placeholder: string }[] }[] = [
  { name: 'OpenAI', vars: [{ key: 'OPENAI_API_KEY', placeholder: 'sk-...' }] },
  { name: 'Supabase', vars: [{ key: 'SUPABASE_URL', placeholder: 'https://xxx.supabase.co' }, { key: 'SUPABASE_ANON_KEY', placeholder: 'eyJ...' }] },
  { name: 'Stripe', vars: [{ key: 'STRIPE_SECRET_KEY', placeholder: 'sk_live_...' }, { key: 'STRIPE_PUBLISHABLE_KEY', placeholder: 'pk_live_...' }] },
  { name: 'ThirdWeb', vars: [{ key: 'THIRDWEB_CLIENT_ID', placeholder: 'your-client-id' }, { key: 'THIRDWEB_SECRET_KEY', placeholder: 'your-secret-key' }] },
  { name: 'Vercel', vars: [{ key: 'VERCEL_TOKEN', placeholder: 'your-vercel-token' }] },
];

const EnvPanel: React.FC<EnvPanelProps> = ({ userId, onEnvChange }) => {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (stored) {
        const vars = JSON.parse(stored);
        setVariables(vars);
        // Notify parent immediately on load
        const envMap: Record<string, string> = {};
        vars.forEach((v: EnvVariable) => { envMap[v.key] = v.value; });
        onEnvChange?.(envMap);
      }
    } catch {}
  }, [userId]);

  const persist = useCallback((vars: EnvVariable[]) => {
    if (!userId) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(vars));
    } catch {}
    const envMap: Record<string, string> = {};
    vars.forEach(v => { envMap[v.key] = v.value; });
    onEnvChange?.(envMap);
  }, [userId, onEnvChange]);

  const addVariable = useCallback(() => {
    const key = newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!key) { toast.error('Key is required'); return; }
    if (variables.some(v => v.key === key)) { toast.error('Key already exists'); return; }
    if (!newValue.trim()) { toast.error('Value is required'); return; }

    const newVar: EnvVariable = {
      id: `env_${Date.now()}`,
      key,
      value: newValue.trim(),
      isSecret: key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN') || key.includes('PASSWORD'),
    };
    const updated = [...variables, newVar];
    setVariables(updated);
    persist(updated);
    setNewKey('');
    setNewValue('');
    setShowAdd(false);
    toast.success(`${key} added`);
  }, [newKey, newValue, variables, persist]);

  const addPreset = useCallback((preset: typeof ENV_PRESETS[0]) => {
    const newVars: EnvVariable[] = [];
    preset.vars.forEach(v => {
      if (!variables.some(existing => existing.key === v.key)) {
        newVars.push({
          id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          key: v.key,
          value: '',
          isSecret: v.key.includes('SECRET') || v.key.includes('KEY') || v.key.includes('TOKEN'),
        });
      }
    });
    if (newVars.length === 0) {
      toast.info('All vars from this preset already exist');
      return;
    }
    const updated = [...variables, ...newVars];
    setVariables(updated);
    persist(updated);
    setShowPresets(false);
    toast.success(`Added ${newVars.length} var(s) from ${preset.name}`);
  }, [variables, persist]);

  const removeVariable = useCallback((id: string) => {
    const v = variables.find(x => x.id === id);
    const updated = variables.filter(x => x.id !== id);
    setVariables(updated);
    persist(updated);
    toast.success(`${v?.key} removed`);
  }, [variables, persist]);

  const updateVariable = useCallback((id: string, value: string) => {
    const updated = variables.map(v => v.id === id ? { ...v, value } : v);
    setVariables(updated);
    persist(updated);
  }, [variables, persist]);

  const toggleVisibility = useCallback((id: string) => {
    setShowValues(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const copyValue = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  }, []);

  const exportEnvFile = useCallback(() => {
    const content = variables.map(v => `${v.key}=${v.value}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '.env'; a.click();
    URL.revokeObjectURL(url);
    toast.success('.env file exported');
  }, [variables]);

  const importEnvFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.env,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        const newVars: EnvVariable[] = [];
        lines.forEach(line => {
          const eqIdx = line.indexOf('=');
          if (eqIdx === -1) return;
          const key = line.slice(0, eqIdx).trim();
          const value = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!key) return;
          if (!variables.some(v => v.key === key)) {
            newVars.push({
              id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              key,
              value,
              isSecret: key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN') || key.includes('PASSWORD'),
            });
          }
        });
        if (newVars.length > 0) {
          const updated = [...variables, ...newVars];
          setVariables(updated);
          persist(updated);
          toast.success(`Imported ${newVars.length} variable(s)`);
        } else {
          toast.info('No new variables to import');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [variables, persist]);

  const maskValue = (value: string) => {
    if (value.length <= 4) return value ? '****' : '(empty)';
    return value.slice(0, 4) + '****';
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-10 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <KeyRound className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Environment Variables</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{variables.length} vars</span>
      </div>

      <div className="p-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 p-2 rounded bg-primary/5 border border-primary/20">
          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-tight">
            Variables are injected into your preview and available to the AI assistant.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {/* Action buttons */}
        <div className="flex gap-1 shrink-0">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowPresets(!showPresets)} title="Presets">
            <Sparkles className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={importEnvFile} title="Import .env">
            <Upload className="w-3 h-3" />
          </Button>
          {variables.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={exportEnvFile} title="Export .env">
              <Download className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Presets */}
        {showPresets && (
          <div className="p-2.5 border border-border rounded-lg bg-muted/30 flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Quick Presets</span>
            {ENV_PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => addPreset(preset)}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-foreground hover:bg-muted transition-colors text-left"
              >
                <Sparkles className="w-3 h-3 text-primary shrink-0" />
                <span className="font-medium">{preset.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{preset.vars.length} vars</span>
              </button>
            ))}
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <div className="p-3 border border-border rounded-lg bg-muted/30 flex flex-col gap-2 shrink-0">
            <Input
              value={newKey}
              onChange={e => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              placeholder="VARIABLE_NAME"
              className="h-8 text-xs font-mono"
            />
            <Input
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="value..."
              type="password"
              className="h-8 text-xs"
            />
            {newKey && (newKey.includes('KEY') || newKey.includes('SECRET') || newKey.includes('TOKEN')) && (
              <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                <span>This will be stored as a secret</span>
              </div>
            )}
            <div className="flex gap-1">
              <Button size="sm" className="flex-1 text-xs h-8" onClick={addVariable}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Variables list */}
        {variables.length === 0 && !showAdd ? (
          <div className="text-center py-8">
            <KeyRound className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">No environment variables</p>
            <p className="text-[10px] text-muted-foreground mt-1">Add API keys, tokens, and secrets</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {variables.map(v => (
              <div key={v.id} className="p-2.5 rounded-lg border border-border hover:border-primary/30 transition-all bg-muted/20">
                <div className="flex items-center gap-2 mb-1.5">
                  {v.isSecret ? (
                    <Shield className="w-3 h-3 text-yellow-400 shrink-0" />
                  ) : (
                    <KeyRound className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-mono font-medium text-foreground truncate">{v.key}</span>
                  {v.isSecret && (
                    <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 rounded">SECRET</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {showValues.has(v.id) ? (
                    <input
                      value={v.value}
                      onChange={e => updateVariable(v.id, e.target.value)}
                      className="flex-1 text-[11px] text-foreground font-mono bg-background/50 px-2 py-1 rounded border border-transparent focus:border-primary focus:outline-none"
                      placeholder="(empty)"
                    />
                  ) : (
                    <code className="flex-1 text-[11px] text-muted-foreground font-mono truncate bg-background/50 px-2 py-1 rounded">
                      {maskValue(v.value)}
                    </code>
                  )}
                  <button onClick={() => toggleVisibility(v.id)} className="p-1 hover:text-foreground text-muted-foreground transition-colors">
                    {showValues.has(v.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  <button onClick={() => copyValue(v.value)} className="p-1 hover:text-foreground text-muted-foreground transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeVariable(v.id)} className="p-1 hover:text-destructive text-muted-foreground transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvPanel;
