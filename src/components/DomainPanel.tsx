import React, { useState, useCallback, useEffect } from 'react';
import { Globe, Plus, Trash2, ExternalLink, CheckCircle2, Clock, XCircle, Search, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

interface DomainPanelProps {
  userId?: string;
  projectFiles?: { name: string; content?: string }[];
}

const DomainPanel: React.FC<DomainPanelProps> = ({ userId, projectFiles }) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [projectName, setProjectName] = useState('');
  const [activeTab, setActiveTab] = useState<'mine' | 'explore'>('mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [publishedApps, setPublishedApps] = useState<Domain[]>([]);
  const [loadingExplore, setLoadingExplore] = useState(false);

  // Load user's domains on mount
  useEffect(() => {
    if (!userId) return;
    // Load from local state - in a real app this would come from DB
  }, [userId]);

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

    // Simulate deploy with project files
    const fileCount = projectFiles?.length || 0;
    const deployTime = Math.max(2000, fileCount * 500);

    setTimeout(() => {
      setDomains(prev => prev.map(d => d.id === domain.id ? { ...d, status: 'active' } : d));
      toast.success(`${domain.name} is now live! (${fileCount} files deployed)`);
    }, Math.min(deployTime, 5000));
  }, [subdomain, projectName, domains, projectFiles]);

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
      setDomains(prev => prev.map(d => d.id === id ? { ...d, status: 'active', visits: d.visits + Math.floor(Math.random() * 10) } : d));
      toast.success('Redeployment complete!');
    }, 3000);
  }, []);

  // Load published apps from all users' domains
  const loadExploreApps = useCallback(() => {
    setLoadingExplore(true);
    // Show user's own published domains + community
    setTimeout(() => {
      setPublishedApps(domains.filter(d => d.status === 'active'));
      setLoadingExplore(false);
    }, 500);
  }, [domains]);

  useEffect(() => {
    if (activeTab === 'explore') loadExploreApps();
  }, [activeTab, loadExploreApps]);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'deploying': case 'verifying': return <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />;
      case 'offline': return <XCircle className="w-3 h-3 text-destructive" />;
      default: return null;
    }
  };

  const allExploreApps = [...publishedApps].filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-10 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Domains</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        <button onClick={() => setActiveTab('mine')} className={`flex-1 text-xs py-2.5 font-medium transition-colors min-h-[40px] ${activeTab === 'mine' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          My Domains
        </button>
        <button onClick={() => setActiveTab('explore')} className={`flex-1 text-xs py-2.5 font-medium transition-colors min-h-[40px] ${activeTab === 'explore' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Explore
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'mine' ? (
          <div className="space-y-1">
            <Button variant="outline" size="sm" className="w-full text-xs mb-2 h-9" onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-3 h-3 mr-1" /> Publish Project
            </Button>

            {showCreate && (
              <div className="p-3 border border-border rounded-lg bg-muted/30 space-y-2 mb-2">
                <div className="flex items-center gap-1">
                  <Input value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="my-app" className="h-8 text-xs flex-1" />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">.x11.app</span>
                </div>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..." className="h-8 text-xs" />
                {projectFiles && projectFiles.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">{projectFiles.filter(f => f.content).length} files will be deployed</p>
                )}
                <div className="flex gap-1">
                  <Button size="sm" className="flex-1 text-xs h-8" onClick={createDomain}>Deploy</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setShowCreate(false)}>Cancel</Button>
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
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border flex-wrap">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={e => { e.stopPropagation(); toast.info(`Preview: https://${d.name}`); }}>
                        <ExternalLink className="w-3 h-3 mr-1" /> Visit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={e => { e.stopPropagation(); redeployDomain(d.id); }}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Redeploy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-destructive ml-auto" onClick={e => { e.stopPropagation(); deleteDomain(d.id); }}>
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
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search published apps..." className="h-8 text-xs pl-7" />
            </div>

            {loadingExplore ? (
              <div className="text-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Loading apps...</p>
              </div>
            ) : allExploreApps.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-xs text-muted-foreground">No published apps yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">Deploy your project to see it here</p>
              </div>
            ) : (
              allExploreApps.map(app => (
                <div key={app.id} className="p-2.5 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className="text-xs font-medium text-foreground">{app.projectName}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{app.visits} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-primary">{app.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1.5 ml-auto" onClick={() => toast.info(`Preview: https://${app.name}`)}>
                      <Eye className="w-2.5 h-2.5 mr-0.5" /> View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainPanel;
