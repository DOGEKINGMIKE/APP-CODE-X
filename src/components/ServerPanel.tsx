import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Server, Power, PowerOff, RotateCcw, Plus, Trash2, Activity, Globe, Cpu, HardDrive, Clock, CheckCircle2, XCircle, Loader2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface VirtualServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'restarting' | 'starting';
  region: string;
  cpu: number;
  ram: number;
  disk: number;
  uptimeStart: number | null;
  createdAt: number;
  domain?: string;
  logs: string[];
}

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'sa-east-1'];
const STORAGE_KEY = 'csx11-servers';

const ServerPanel: React.FC = () => {
  const [servers, setServers] = useState<VirtualServer[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState(REGIONS[0]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  const persist = (s: VirtualServer[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  };

  // Simulate resource fluctuations every 3 seconds
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setServers(prev => {
        const updated = prev.map(s => {
          if (s.status !== 'running') return s;
          return {
            ...s,
            cpu: Math.max(2, Math.min(95, s.cpu + Math.floor(Math.random() * 11) - 5)),
            ram: Math.max(10, Math.min(95, s.ram + Math.floor(Math.random() * 7) - 3)),
            disk: Math.min(95, s.disk + (Math.random() > 0.9 ? 1 : 0)),
          };
        });
        persist(updated);
        return updated;
      });
    }, 3000);
    return () => clearInterval(tickRef.current);
  }, []);

  const addLog = (id: string, msg: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setServers(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, logs: [...s.logs.slice(-49), `[${ts}] ${msg}`] } : s
      );
      persist(updated);
      return updated;
    });
  };

  const createServer = useCallback(() => {
    if (!newName.trim()) { toast.error('Server name required'); return; }
    const server: VirtualServer = {
      id: `srv_${Date.now()}`,
      name: newName.trim(),
      status: 'starting',
      region: newRegion,
      cpu: Math.floor(Math.random() * 15) + 5,
      ram: Math.floor(Math.random() * 20) + 20,
      disk: Math.floor(Math.random() * 10) + 5,
      uptimeStart: null,
      createdAt: Date.now(),
      logs: [`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Server provisioning started...`],
    };
    const updated = [...servers, server];
    setServers(updated);
    persist(updated);
    setNewName('');
    setShowCreate(false);
    toast.success(`Server "${server.name}" is starting...`);
    setTimeout(() => {
      setServers(prev => {
        const u = prev.map(s => s.id === server.id ? { ...s, status: 'running' as const, uptimeStart: Date.now(), logs: [...s.logs, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Server is now running`] } : s);
        persist(u);
        return u;
      });
      toast.success(`Server "${server.name}" is now running`);
    }, 2500);
  }, [newName, newRegion, servers]);

  const toggleServer = useCallback((id: string) => {
    setServers(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        if (s.status === 'running') {
          toast.info(`Stopping "${s.name}"...`);
          setTimeout(() => {
            setServers(p => {
              const u = p.map(x => x.id === id ? { ...x, status: 'stopped' as const, uptimeStart: null } : x);
              persist(u);
              return u;
            });
            addLog(id, 'Server stopped');
          }, 1500);
          return { ...s, status: 'restarting' as const };
        }
        if (s.status === 'stopped') {
          toast.info(`Starting "${s.name}"...`);
          setTimeout(() => {
            setServers(p => {
              const u = p.map(x => x.id === id ? { ...x, status: 'running' as const, uptimeStart: Date.now() } : x);
              persist(u);
              return u;
            });
            addLog(id, 'Server started');
          }, 2000);
          return { ...s, status: 'starting' as const };
        }
        return s;
      });
      persist(updated);
      return updated;
    });
  }, []);

  const restartServer = useCallback((id: string) => {
    setServers(prev => {
      const updated = prev.map(s => {
        if (s.id !== id || s.status !== 'running') return s;
        toast.info(`Restarting "${s.name}"...`);
        addLog(id, 'Server restarting...');
        setTimeout(() => {
          setServers(p => {
            const u = p.map(x => x.id === id ? { ...x, status: 'running' as const, uptimeStart: Date.now() } : x);
            persist(u);
            return u;
          });
          addLog(id, 'Server restarted successfully');
        }, 3000);
        return { ...s, status: 'restarting' as const };
      });
      persist(updated);
      return updated;
    });
  }, []);

  const deleteServer = useCallback((id: string) => {
    const srv = servers.find(s => s.id === id);
    const updated = servers.filter(s => s.id !== id);
    setServers(updated);
    persist(updated);
    if (selectedServer === id) setSelectedServer(null);
    toast.success(`Server "${srv?.name}" deleted`);
  }, [servers, selectedServer]);

  const formatUptime = (start: number | null) => {
    if (!start) return '--';
    const diff = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case 'stopped': return <XCircle className="w-3.5 h-3.5 text-muted-foreground" />;
      case 'starting': case 'restarting': return <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />;
      default: return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400';
      case 'stopped': return 'text-muted-foreground';
      case 'starting': case 'restarting': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  const ResourceBar: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className="text-muted-foreground flex items-center gap-0.5 w-12 shrink-0">{icon}{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${value > 80 ? 'bg-destructive' : value > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`w-8 text-right font-mono ${value > 80 ? 'text-destructive' : 'text-muted-foreground'}`}>{value}%</span>
    </div>
  );

  const selected = servers.find(s => s.id === selectedServer);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Server className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Servers</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{servers.filter(s => s.status === 'running').length}/{servers.length} online</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        <Button variant="outline" size="sm" className="w-full text-xs mb-1 shrink-0" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-3 h-3 mr-1" /> New Server
        </Button>

        {showCreate && (
          <div className="p-3 border border-border rounded-lg bg-muted/30 flex flex-col gap-2 mb-1 shrink-0">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Server name..." className="h-7 text-xs" />
            <select value={newRegion} onChange={e => setNewRegion(e.target.value)} className="w-full bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground">
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-1">
              <Button size="sm" className="flex-1 text-xs h-7" onClick={createServer}>Create</Button>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {servers.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground">No servers yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">Create one to get started</p>
          </div>
        ) : (
          servers.map(srv => (
            <div
              key={srv.id}
              onClick={() => { setSelectedServer(srv.id); setShowLogs(false); }}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selectedServer === srv.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/30'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {statusIcon(srv.status)}
                <span className="text-xs font-medium text-foreground flex-1 truncate">{srv.name}</span>
                <span className={`text-[10px] capitalize ${statusColor(srv.status)}`}>{srv.status}</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{srv.region}</span>
                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatUptime(srv.uptimeStart)}</span>
              </div>

              {/* Resource bars */}
              {srv.status === 'running' && (
                <div className="flex flex-col gap-1 mb-2">
                  <ResourceBar label="CPU" value={srv.cpu} icon={<Cpu className="w-2.5 h-2.5" />} />
                  <ResourceBar label="RAM" value={srv.ram} icon={<HardDrive className="w-2.5 h-2.5" />} />
                  <ResourceBar label="Disk" value={srv.disk} icon={<HardDrive className="w-2.5 h-2.5" />} />
                </div>
              )}

              {selectedServer === srv.id && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1 flex-wrap">
                    {srv.status === 'running' ? (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); toggleServer(srv.id); }}>
                        <PowerOff className="w-3 h-3 mr-1" /> Stop
                      </Button>
                    ) : srv.status === 'stopped' ? (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-green-400" onClick={e => { e.stopPropagation(); toggleServer(srv.id); }}>
                        <Power className="w-3 h-3 mr-1" /> Start
                      </Button>
                    ) : null}
                    {srv.status === 'running' && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); restartServer(srv.id); }}>
                        <RotateCcw className="w-3 h-3 mr-1" /> Restart
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); setShowLogs(!showLogs); }}>
                      <Terminal className="w-3 h-3 mr-1" /> Logs
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-destructive ml-auto" onClick={e => { e.stopPropagation(); deleteServer(srv.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Server logs */}
                  {showLogs && (
                    <div className="bg-background rounded border border-border p-2 max-h-32 overflow-y-auto font-mono">
                      {srv.logs.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">No logs yet</p>
                      ) : (
                        srv.logs.map((log, i) => (
                          <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">{log}</p>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServerPanel;
