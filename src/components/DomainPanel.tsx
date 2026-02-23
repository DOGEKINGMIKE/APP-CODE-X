import React, { useState, useCallback } from 'react';
import { Globe, Plus, Trash2, ExternalLink, CheckCircle2, Clock, XCircle, Search, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Domain {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'deploying' | 'offline' | 'verifying';
  projectName: string;
  ssl: boolean;
  createdAt: Date;
  visits: number;
}

interface PublishedApp {
  id: string;
  name: string;
  domain: string;
  author: string;
  description: string;
  visits: number;
  status: 'live' | 'maintenance';
}

const SAMPLE_APPS: PublishedApp[] = [
  { id: '1', name: 'Portfolio Pro', domain: 'portfolio.x11.app', author: 'alex_dev', description: 'Modern portfolio template with animations', visits: 1247, status: 'live' },
  { id: '2', name: 'Task Manager', domain: 'tasks.x11.app', author: 'sarah_codes', description: 'Full-featured project management app', visits: 893, status: 'live' },
  { id: '3', name: 'Blog Engine', domain: 'blog.x11.app', author: 'dev_mike', description: 'Markdown-powered blog with dark mode', visits: 2104, status: 'live' },
  { id: '4', name: 'E-Commerce Lite', domain: 'shop.x11.app', author: 'nina_tech', description: 'Lightweight shopping experience', visits: 567, status: 'maintenance' },
];

const DomainPanel: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [projectName, setProjectName] = useState('');
  const [activeTab, setActiveTab] = useState<'mine' | 'explore'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const createDomain = useCallback(() => {
    if (!subdomain.trim()) { toast.error('Subdomain required'); return; }
    if (!/^[a-z0-9-]+$/.test(subdomain)) { toast.error('Only lowercase letters, numbers, hyphens'); return; }
    if (domains.some(d => d.subdomain === subdomain)) { toast.error('Subdomain already taken'); return; }

    const domain: Domain = {
      id: `dom_${Date.now()}`,
      name: `${subdomain}.x11.app`,
      subdomain,
      status: 'deploying',
      projectName: projectName || 'Untitled Project',
      ssl: true,
      createdAt: new Date(),
      visits: 0,
    };
    setDomains(prev => [...prev, domain]);
    setSubdomain('');
    setProjectName('');
    setShowCreate(false);
    toast.success(`Deploying to ${domain.name}...`);

    setTimeout(() => {
      setDomains(prev => prev.map(d => d.id === domain.id ? { ...d, status: 'active' } : d));
      toast.success(`${domain.name} is now live!`);
    }, 4000);
  }, [subdomain, projectName, domains]);

  const deleteDomain = useCallback((id: string) => {
    const d = domains.find(x => x.id === id);
    setDomains(prev => prev.filter(x => x.id !== id));
    if (selectedDomain === id) setSelectedDomain(null);
    toast.success(`${d?.name} removed`);
  }, [domains, selectedDomain]);

  const redeployDomain = useCallback((id: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, status: 'deploying' } : d));
    toast.info('Redeploying...');
    setTimeout(() => {
      setDomains(prev => prev.map(d => d.id === id ? { ...d, status: 'active' } : d));
      toast.success('Redeployment complete!');
    }, 3000);
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'deploying': case 'verifying': return <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />;
      case 'offline': return <XCircle className="w-3 h-3 text-destructive" />;
      default: return null;
    }
  };

  const filteredApps = SAMPLE_APPS.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-8 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Domains</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        <button onClick={() => setActiveTab('mine')} className={`flex-1 text-xs py-2 font-medium transition-colors ${activeTab === 'mine' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          My Domains
        </button>
        <button onClick={() => setActiveTab('explore')} className={`flex-1 text-xs py-2 font-medium transition-colors ${activeTab === 'explore' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Explore
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'mine' ? (
          <div className="space-y-1">
            <Button variant="outline" size="sm" className="w-full text-xs mb-2" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-3 h-3 mr-1" /> Publish Project
            </Button>

            {showCreate && (
              <div className="p-3 border border-border rounded-lg bg-muted/30 space-y-2 mb-2">
                <div className="flex items-center gap-1">
                  <Input value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="my-app" className="h-7 text-xs flex-1" />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">.x11.app</span>
                </div>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..." className="h-7 text-xs" />
                <div className="flex gap-1">
                  <Button size="sm" className="flex-1 text-xs h-7" onClick={createDomain}>Deploy</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {domains.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-xs text-muted-foreground">No domains yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">Publish your project to get a live URL</p>
              </div>
            ) : (
              domains.map(d => (
                <div key={d.id} onClick={() => setSelectedDomain(d.id)} className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selectedDomain === d.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon(d.status)}
                    <span className="text-xs font-medium text-foreground truncate">{d.name}</span>
                    {d.ssl && <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded">SSL</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{d.projectName}</span>
                    <span>•</span>
                    <span>{d.visits} visits</span>
                    <span className={`capitalize ${d.status === 'active' ? 'text-green-400' : d.status === 'deploying' ? 'text-yellow-400' : 'text-destructive'}`}>{d.status}</span>
                  </div>

                  {selectedDomain === d.id && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); window.open(`https://${d.name}`, '_blank'); }}>
                        <ExternalLink className="w-3 h-3 mr-1" /> Visit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={e => { e.stopPropagation(); redeployDomain(d.id); }}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Redeploy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-destructive ml-auto" onClick={e => { e.stopPropagation(); deleteDomain(d.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search apps..." className="h-7 text-xs pl-7" />
            </div>

            {filteredApps.map(app => (
              <div key={app.id} className="p-2.5 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'live' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-xs font-medium text-foreground">{app.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{app.visits} views</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{app.description}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-primary">{app.domain}</span>
                  <span className="text-muted-foreground">by {app.author}</span>
                  <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 ml-auto" onClick={() => window.open(`https://${app.domain}`, '_blank')}>
                    <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainPanel;
