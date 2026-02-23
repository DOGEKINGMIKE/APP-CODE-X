import React, { useState, useCallback } from 'react';
import { Server, Power, PowerOff, RotateCcw, Plus, Trash2, Activity, Globe, Cpu, HardDrive, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
  uptime: number;
  createdAt: Date;
  domain?: string;
}

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

const ServerPanel: React.FC = () => {
  const [servers, setServers] = useState<VirtualServer[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState(REGIONS[0]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const createServer = useCallback(() => {
    if (!newName.trim()) { toast.error('Server name required'); return; }
    const server: VirtualServer = {
      id: `srv_${Date.now()}`,
      name: newName.trim(),
      status: 'starting',
      region: newRegion,
      cpu: Math.floor(Math.random() * 30) + 5,
      ram: Math.floor(Math.random() * 40) + 20,
      uptime: 0,
      createdAt: new Date(),
    };
    setServers(prev => [...prev, server]);
    setNewName('');
    setShowCreate(false);
    toast.success(`Server "${server.name}" is starting...`);
    setTimeout(() => {
      setServers(prev => prev.map(s => s.id === server.id ? { ...s, status: 'running' } : s));
      toast.success(`Server "${server.name}" is now running`);
    }, 2500);
  }, [newName, newRegion]);

  const toggleServer = useCallback((id: string) => {
    setServers(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.status === 'running') {
        toast.info(`Stopping "${s.name}"...`);
        setTimeout(() => setServers(p => p.map(x => x.id === id ? { ...x, status: 'stopped' } : x)), 1500);
        return { ...s, status: 'stopping' as any };
      }
      if (s.status === 'stopped') {
        toast.info(`Starting "${s.name}"...`);
        setTimeout(() => setServers(p => p.map(x => x.id === id ? { ...x, status: 'running' } : x)), 2000);
        return { ...s, status: 'starting' };
      }
      return s;
    }));
  }, []);

  const restartServer = useCallback((id: string) => {
    setServers(prev => prev.map(s => {
      if (s.id !== id || s.status !== 'running') return s;
      toast.info(`Restarting "${s.name}"...`);
      setTimeout(() => setServers(p => p.map(x => x.id === id ? { ...x, status: 'running' } : x)), 3000);
      return { ...s, status: 'restarting' };
    }));
  }, []);

  const deleteServer = useCallback((id: string) => {
    const srv = servers.find(s => s.id === id);
    setServers(prev => prev.filter(s => s.id !== id));
    if (selectedServer === id) setSelectedServer(null);
    toast.success(`Server "${srv?.name}" deleted`);
  }, [servers, selectedServer]);

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

  const selected = servers.find(s => s.id === selectedServer);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Server className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Servers</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{servers.filter(s => s.status === 'running').length}/{servers.length} online</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Server list */}
        <div className="w-full overflow-y-auto p-2 space-y-1">
          <Button variant="outline" size="sm" className="w-full text-xs mb-2" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-3 h-3 mr-1" /> New Server
          </Button>

          {showCreate && (
            <div className="p-3 border border-border rounded-lg bg-muted/30 space-y-2 mb-2">
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
              <div key={srv.id} onClick={() => setSelectedServer(srv.id)} className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selectedServer === srv.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {statusIcon(srv.status)}
                  <span className="text-xs font-medium text-foreground flex-1 truncate">{srv.name}</span>
                  <span className={`text-[10px] capitalize ${statusColor(srv.status)}`}>{srv.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" />{srv.region}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5" />{srv.cpu}%</span>
                  <span className="flex items-center gap-1"><HardDrive className="w-2.5 h-2.5" />{srv.ram}%</span>
                </div>

                {selectedServer === srv.id && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
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
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-destructive ml-auto" onClick={e => { e.stopPropagation(); deleteServer(srv.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerPanel;
