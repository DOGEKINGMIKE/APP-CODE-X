import { useState, useEffect, useCallback } from 'react';

export type ThemeId = 'default' | 'monokai' | 'dracula' | 'github-dark' | 'light';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  monacoTheme: string;
}

export const themes: ThemeOption[] = [
  { id: 'default', name: 'Default Dark', monacoTheme: 'vs-dark' },
  { id: 'monokai', name: 'Monokai', monacoTheme: 'monokai' },
  { id: 'dracula', name: 'Dracula', monacoTheme: 'dracula' },
  { id: 'github-dark', name: 'GitHub Dark', monacoTheme: 'github-dark' },
  { id: 'light', name: 'Light', monacoTheme: 'light' },
];

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem('csx11-theme') as ThemeId) || 'default';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('csx11-theme', theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeId) => setThemeState(t), []);
  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return { theme, setTheme, currentTheme, themes };
}
