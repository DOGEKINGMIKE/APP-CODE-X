import React, { useState, useEffect } from 'react';
import { Code2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setValid(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success('Password updated!'); navigate('/'); }
  };

  if (!valid) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-hero p-4">
        <div className="text-center">
          <Code2 className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-foreground">Invalid or expired reset link.</p>
          <Button variant="link" onClick={() => navigate('/auth')} className="mt-2">Go to sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-editor">
        <h2 className="text-lg font-semibold text-foreground mb-4">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required minLength={6} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} className="pl-10" required minLength={6} />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
