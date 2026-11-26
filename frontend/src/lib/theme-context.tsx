'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type Palette = 'lime' | 'cobalt' | 'violet' | 'amber' | 'ocean' | 'crimson';

export interface PaletteInfo {
  id: Palette;
  name: string;
  tagline: string;
  dotColor: string;
  badgeBg: string;
}

export const AVAILABLE_PALETTES: PaletteInfo[] = [
  {
    id: 'lime',
    name: 'Forest & Lime',
    tagline: 'Futuristic Fintech / Growth',
    dotColor: '#84CC16',
    badgeBg: 'bg-lime-500',
  },
  {
    id: 'cobalt',
    name: 'Cobalt Indigo',
    tagline: 'Stripe / Linear High-Trust',
    dotColor: '#2563EB',
    badgeBg: 'bg-blue-600',
  },
  {
    id: 'violet',
    name: 'Iris Violet',
    tagline: 'Modern AI & Intelligence',
    dotColor: '#7C3AED',
    badgeBg: 'bg-purple-600',
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    tagline: 'Prestige Academy & Executive',
    dotColor: '#D97706',
    badgeBg: 'bg-amber-500',
  },
  {
    id: 'ocean',
    name: 'Nordic Ocean',
    tagline: 'Glacier Cyan & Deep Tech',
    dotColor: '#0284C7',
    badgeBg: 'bg-sky-500',
  },
  {
    id: 'crimson',
    name: 'Heritage Crimson',
    tagline: 'Oxford & Ivy League Classic',
    dotColor: '#BE123C',
    badgeBg: 'bg-rose-600',
  },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
  nextPalette: () => void;
  palettes: PaletteInfo[];
  currentPaletteInfo: PaletteInfo;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  palette: 'lime',
  setPalette: () => {},
  nextPalette: () => {},
  palettes: AVAILABLE_PALETTES,
  currentPaletteInfo: AVAILABLE_PALETTES[0],
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [palette, setPaletteState] = useState<Palette>('lime');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Initialize Theme (light / dark)
    const savedTheme = localStorage.getItem('edu360-theme') as Theme | null;
    let initialTheme: Theme = 'light';
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = prefersDark ? 'dark' : 'light';
    }
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    // 2. Initialize Palette (lime / cobalt / violet / amber / ocean / crimson)
    const savedPalette = localStorage.getItem('edu360-palette') as Palette | null;
    const isValidPalette = AVAILABLE_PALETTES.some((p) => p.id === savedPalette);
    const initialPalette: Palette = isValidPalette && savedPalette ? savedPalette : 'lime';
    setPaletteState(initialPalette);
    applyPalette(initialPalette);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const applyPalette = (p: Palette) => {
    const root = document.documentElement;
    root.setAttribute('data-palette', p);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('edu360-theme', t);
    applyTheme(t);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const setPalette = (p: Palette) => {
    setPaletteState(p);
    localStorage.setItem('edu360-palette', p);
    applyPalette(p);
  };

  const nextPalette = () => {
    const currentIndex = AVAILABLE_PALETTES.findIndex((p) => p.id === palette);
    const nextIndex = (currentIndex + 1) % AVAILABLE_PALETTES.length;
    setPalette(AVAILABLE_PALETTES[nextIndex].id);
  };

  const currentPaletteInfo =
    AVAILABLE_PALETTES.find((p) => p.id === palette) || AVAILABLE_PALETTES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        palette,
        setPalette,
        nextPalette,
        palettes: AVAILABLE_PALETTES,
        currentPaletteInfo,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
