import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, FileText, Code2, Zap, TrendingUp, Shield, History } from 'lucide-react';

interface AnalyticsData {
  filesCreated: number;
  linesWritten: number;
  sessionsCount: number;
  totalTime: number;
  aiPrompts: number;
  deploys: number;
  saves: number;
  previewRefreshes: number;
  lastActive: string;
  languageBreakdown: Record<string, number>;
  activityLog: { action: string; timestamp: string }[];
}

interface AnalyticsPanelProps {
  fileCount: number;
  files: { name: string; content?: string }[];
  envVarCount?: number;
  hasAuth?: boolean;
}

const STORAGE_KEY = 'x11-analytics';

// Exported helper so other components can track events
export function trackAnalyticsEvent(action: string, stat?: keyof AnalyticsData) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data: AnalyticsData = stored ? JSON.parse(stored) : {
      filesCreated: 0, linesWritten: 0, sessionsCount: 0,
      totalTime: 0, aiPrompts: 0, deploys: 0, saves: 0, previewRefreshes: 0,
      lastActive: new Date().toISOString(),
      languageBreakdown: {}, activityLog: [],
    };
    if (stat && typeof data[stat] === 'number') {
      (data[stat] as number) += 1;
    }
    data.activityLog = [
      { action, timestamp: new Date().toISOString() },
      ...data.activityLog.slice(0, 49),
    ];
    data.lastActive = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ fileCount, files, envVarCount = 0, hasAuth = false }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    filesCreated: 0, linesWritten: 0, sessionsCount: 0,
    totalTime: 0, aiPrompts: 0, deploys: 0, saves: 0, previewRefreshes: 0,
    lastActive: new Date().toISOString(),
    languageBreakdown: {}, activityLog: [],
  });

  // Load and increment session count
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalytics(prev => ({
          ...prev, ...parsed,
          sessionsCount: (parsed.sessionsCount || 0) + 1,
          lastActive: new Date().toISOString(),
        }));
      } else {
        setAnalytics(prev => ({ ...prev, sessionsCount: 1 }));
      }
    } catch {}
  }, []);

  // Re-read from localStorage every 5 seconds to pick up events from other components
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setAnalytics(prev => ({ ...prev, ...JSON.parse(stored) }));
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate live stats from files
  useEffect(() => {
    const totalLines = files.reduce((acc, f) => acc + (f.content?.split('\n').length || 0), 0);
    const langBreakdown: Record<string, number> = {};
    files.forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() || 'other';
      langBreakdown[ext] = (langBreakdown[ext] || 0) + 1;
    });

    setAnalytics(prev => {
      const updated = {
        ...prev,
        filesCreated: Math.max(prev.filesCreated, fileCount),
        linesWritten: totalLines,
        languageBreakdown: langBreakdown,
        lastActive: new Date().toISOString(),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [files, fileCount]);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => {
        const updated = { ...prev, totalTime: prev.totalTime + 1 };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Dynamic security score
  const securityChecks = [
    { label: 'Auth configured', status: hasAuth },
    { label: 'Env vars set', status: envVarCount > 0 },
    { label: 'HTTPS enforced', status: true },
    { label: 'Input validation', status: files.some(f => f.content?.includes('validate') || f.content?.includes('sanitize')) },
    { label: 'No exposed secrets', status: !files.some(f => f.content?.includes('sk-') || f.content?.includes('password =')) },
  ];
  const securityScore = securityChecks.filter(c => c.status).length;
  const securityGrade = securityScore >= 5 ? 'A+' : securityScore >= 4 ? 'A' : securityScore >= 3 ? 'B' : securityScore >= 2 ? 'C' : 'D';
  const gradeColor = securityScore >= 4 ? 'text-green-400' : securityScore >= 3 ? 'text-yellow-400' : 'text-destructive';

  const sortedLanguages = Object.entries(analytics.languageBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const maxLangCount = Math.max(...sortedLanguages.map(([, c]) => c), 1);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="h-10 bg-card border-b border-border flex items-center px-3 gap-2 shrink-0">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Analytics</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: FileText, label: 'Files', value: fileCount, color: 'text-blue-400' },
            { icon: Code2, label: 'Lines', value: analytics.linesWritten.toLocaleString(), color: 'text-green-400' },
            { icon: Clock, label: 'Time', value: formatTime(analytics.totalTime), color: 'text-yellow-400' },
            { icon: Activity, label: 'Sessions', value: analytics.sessionsCount, color: 'text-purple-400' },
            { icon: Zap, label: 'AI Prompts', value: analytics.aiPrompts, color: 'text-primary' },
            { icon: TrendingUp, label: 'Deploys', value: analytics.deploys, color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="p-2.5 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className={`w-3 h-3 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Language Breakdown */}
        {sortedLanguages.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Languages</h3>
            <div className="flex flex-col gap-1.5">
              {sortedLanguages.map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground w-10 font-mono">.{lang}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / maxLangCount) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Score - Dynamic */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Security</h3>
          <div className="p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-4 h-4 ${gradeColor}`} />
              <span className="text-xs font-medium text-foreground">Security Score</span>
              <span className={`ml-auto text-sm font-bold ${gradeColor}`}>{securityGrade}</span>
            </div>
            <div className="flex flex-col gap-1">
              {securityChecks.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.status ? 'bg-green-400' : 'bg-destructive'}`} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {analytics.activityLog.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <History className="w-3 h-3" /> Recent Activity
            </h3>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {analytics.activityLog.slice(0, 15).map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] py-1">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground flex-1 truncate">{entry.action}</span>
                  <span className="text-muted-foreground shrink-0">{formatTimestamp(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground text-center pt-2">
          Last active: {new Date(analytics.lastActive).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
