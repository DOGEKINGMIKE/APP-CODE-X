import React, { useState } from 'react';
import { Code2, Play, FileText, Folder, Zap, Globe, Paintbrush, Braces, FileCode, Rocket, Shield, Cpu, Info, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import heroImage from '@/assets/hero-code-editor.jpg';

interface WelcomeScreenProps {
  onCreateFile: (name: string, type: 'file' | 'folder') => void;
}

const templates = [
  {
    name: 'Web App',
    icon: <Globe className="w-5 h-5" />,
    files: [
      { name: 'index.html', type: 'file' as const },
      { name: 'style.css', type: 'file' as const },
      { name: 'script.js', type: 'file' as const },
    ],
    description: 'HTML + CSS + JS starter',
  },
  {
    name: 'React App',
    icon: <Braces className="w-5 h-5" />,
    files: [
      { name: 'App.tsx', type: 'file' as const },
      { name: 'style.css', type: 'file' as const },
    ],
    description: 'React + TypeScript component',
  },
  {
    name: 'Landing Page',
    icon: <Rocket className="w-5 h-5" />,
    files: [
      { name: 'index.html', type: 'file' as const },
      { name: 'style.css', type: 'file' as const },
      { name: 'script.js', type: 'file' as const },
    ],
    description: 'Modern responsive landing',
  },
  {
    name: 'Crypto dApp',
    icon: <Shield className="w-5 h-5" />,
    files: [
      { name: 'index.html', type: 'file' as const },
      { name: 'style.css', type: 'file' as const },
      { name: 'app.js', type: 'file' as const },
      { name: 'config.js', type: 'file' as const },
    ],
    description: 'Web3 + thirdweb SDK',
  },
  {
    name: 'Python Script',
    icon: <FileCode className="w-5 h-5" />,
    files: [
      { name: 'main.py', type: 'file' as const },
    ],
    description: 'Python starter template',
  },
  {
    name: 'API Server',
    icon: <Cpu className="w-5 h-5" />,
    files: [
      { name: 'server.js', type: 'file' as const },
      { name: 'package.json', type: 'file' as const },
    ],
    description: 'Node.js Express server',
  },
];

const envTemplate = `# ─── Environment Variables Template ───
# Copy this to your .env file and fill in the values.
# NEVER commit .env files with real secrets to Git.

# App Configuration
APP_NAME=MyApp
APP_ENV=development
APP_PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# API Keys (keep secret!)
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here

# Third-party Services
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...

# Web3 / Crypto (optional)
WALLET_PRIVATE_KEY=0x...
INFURA_PROJECT_ID=your_project_id
CHAIN_ID=1
`;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateFile }) => {
  const [showEnvGuide, setShowEnvGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTemplateClick = (template: typeof templates[0]) => {
    template.files.forEach(f => onCreateFile(f.name, f.type));
  };

  const copyEnvTemplate = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-hero p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-5xl w-full">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-6 sm:mb-8 relative group">
            <div className="absolute -inset-1 bg-gradient-primary rounded-xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
            <img
              src={heroImage}
              alt="Code Studio X-11 — Next Generation Cloud IDE"
              className="relative w-full max-w-3xl mx-auto rounded-xl shadow-editor object-cover aspect-video"
              loading="eager"
            />
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Code Studio X-11
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-primary font-semibold tracking-widest uppercase mb-4">by MEMEXCORP</p>

          <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            AI-powered cloud IDE with live preview, multi-language support, Web3 tooling, and NOVA AI assistant.
            Build, preview, and ship production apps — all in your browser.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Live Preview', desc: 'Instant rendering' },
              { icon: <FileText className="w-6 h-6" />, title: 'Multi-Language', desc: 'HTML, CSS, JS, Python…' },
              { icon: <Folder className="w-6 h-6" />, title: 'File Explorer', desc: 'Organize your project' },
              { icon: <Shield className="w-6 h-6" />, title: 'Web3 Ready', desc: 'Crypto dApps built-in' },
            ].map((feat) => (
              <Card key={feat.title} className="p-4 bg-card/50 backdrop-blur border-border hover:bg-card/70 hover:border-primary/30 transition-all">
                <div className="text-primary mb-2 flex justify-center">{feat.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{feat.title}</h3>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">Quick Start Templates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <Button
                key={tpl.name}
                variant="outline"
                onClick={() => handleTemplateClick(tpl)}
                className="flex flex-col items-center gap-2 h-auto py-4 px-3 border-border hover:border-primary hover:bg-primary/10 transition-all group"
              >
                <div className="text-primary group-hover:scale-110 transition-transform">{tpl.icon}</div>
                <span className="font-medium text-sm">{tpl.name}</span>
                <span className="text-[10px] text-muted-foreground">{tpl.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* ENV Guide */}
        <div className="mb-8">
          <button
            onClick={() => setShowEnvGuide(!showEnvGuide)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card/50 backdrop-blur border border-border rounded-lg hover:border-primary/30 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Environment Variables (.env) Guide</span>
            </div>
            {showEnvGuide ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showEnvGuide && (
            <div className="mt-2 p-4 bg-card/70 border border-border rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong> Environment variables (<code className="text-primary">.env</code> files) are <strong>not</strong> loaded in this cloud IDE. They contain secrets like API keys and should never be committed to Git.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>📋 <strong className="text-foreground">How to use:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Copy the template below</li>
                  <li>Export your project as ZIP or push to GitHub</li>
                  <li>Create a <code className="text-primary">.env</code> file in your project root</li>
                  <li>Paste and fill in your real values</li>
                  <li>Add <code className="text-primary">.env</code> to your <code className="text-primary">.gitignore</code></li>
                </ol>
              </div>
              <div className="relative">
                <pre className="bg-editor-background rounded-lg p-3 text-xs text-foreground overflow-x-auto font-mono whitespace-pre">
                  {envTemplate}
                </pre>
                <Button variant="secondary" size="sm" onClick={copyEnvTemplate} className="absolute top-2 right-2 h-7 text-xs gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Start coding CTA */}
        <div className="text-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => onCreateFile('index.html', 'file')}
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow text-base px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Coding
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono text-[10px]">Ctrl+K</kbd> for command palette
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
