import React, { useState, useCallback, useEffect } from 'react';
import { KeyRound, Plus, Trash2, Eye, EyeOff, Shield, Copy, Save, AlertTriangle } from 'lucide-react';
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

const EnvPanel: React.FC<EnvPanelProps> = ({ userId, onEnvChange }) => {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (stored) setVariables(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [userId]);

  // Persist to localStorage
  const persist = useCallback((vars: EnvVariable[]) => {
    if (!userId) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(vars));
    } catch { /* ignore */ }
    // Notify parent of env changes
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

  const maskValue = (value: string) => {
    if (value.length <= 4) return '••••••••';
    return value.slice(0, 4) + '••••••••';
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
            Secrets are encrypted and only accessible in your project's server environment.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <Button variant="outline" size="sm" className="w-full text-xs mb-2 h-9" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3 mr-1" /> Add Variable
        </Button>

        {showAdd && (
          <div className="p-3 border border-border rounded-lg bg-muted/30 space-y-2 mb-3">
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

        {variables.length === 0 ? (
          <div className="text-center py-8">
            <KeyRound className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">No environment variables</p>
            <p className="text-[10px] text-muted-foreground mt-1">Add API keys, tokens, and secrets for your projects</p>
          </div>
        ) : (
          <div className="space-y-1.5">
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
                  <code className="flex-1 text-[11px] text-muted-foreground font-mono truncate bg-background/50 px-2 py-1 rounded">
                    {showValues.has(v.id) ? v.value : maskValue(v.value)}
                  </code>
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
