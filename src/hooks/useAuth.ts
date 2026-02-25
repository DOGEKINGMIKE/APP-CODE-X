import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';

// Guest user — app works without any authentication
const GUEST_USER = {
  id: 'guest-local',
  email: 'guest@codestudio-x11.app',
  app_metadata: {},
  user_metadata: { display_name: 'Guest' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

export const useAuth = () => {
  const [user] = useState<User | null>(GUEST_USER);
  const [session] = useState<Session | null>(null);
  const [loading] = useState(false);

  const signOut = async () => {
    return { error: null };
  };

  return { user, session, loading, signOut };
};
