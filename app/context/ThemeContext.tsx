"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  overlay: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderFocus: string;
  cardBg: string;
  cardBorder: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  navBg: string;
  navBorder: string;
  navActive: string;
  navInactive: string;
  goldGradient: string[];
  secondary: string;
  textDark: string;
  textGold: string;
  goldSolid: string;
  blueButton: string;
  actions: Record<string, { bg: string; icon: string }>;
}

export const DARK_COLORS: ThemeColors = {
  background: '#040712',
  surface: '#0B0F1E',
  surfaceElevated: '#12172F',
  overlay: 'rgba(0,0,0,0.82)',
  primary: '#F59E0B',
  primaryLight: 'rgba(245,158,11,0.08)',
  primaryDark: '#D97706',
  primaryGlow: 'rgba(245,158,11,0.25)',
  textPrimary: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#64748B',
  textInverse: '#040712',
  border: 'rgba(255,255,255,0.08)',
  borderFocus: '#F59E0B',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.06)',
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.08)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.08)',
  error: '#EF4444',
  errorBg: 'rgba(239,68,68,0.08)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.08)',
  inputBg: 'rgba(255,255,255,0.02)',
  inputBorder: 'rgba(255,255,255,0.05)',
  inputText: '#F8FAFC',
  placeholder: '#475569',
  navBg: '#060918',
  navBorder: 'rgba(255,255,255,0.05)',
  navActive: '#F59E0B',
  navInactive: '#475569',
  goldGradient: ['#FBBF24', '#F59E0B', '#B45309'],
  secondary: '#3B82F6',
  textDark: '#F8FAFC',
  textGold: '#F59E0B',
  goldSolid: '#F59E0B',
  blueButton: '#3B82F6',
  actions: {
    withdraw:    { bg: 'rgba(245,158,11,0.08)',  icon: '#F59E0B' },
    transfer:    { bg: 'rgba(245,158,11,0.08)',  icon: '#F59E0B' },
    paylence:    { bg: 'rgba(16,185,129,0.08)',  icon: '#10B981' },
    sell:        { bg: 'rgba(245,158,11,0.08)',  icon: '#F59E0B' },
    giftcard:    { bg: 'rgba(236,72,153,0.08)', icon: '#EC4899' },
    topup:       { bg: 'rgba(59,130,246,0.08)', icon: '#3B82F6' },
    cable:       { bg: 'rgba(139,92,246,0.08)', icon: '#8B5CF6' },
    electricity: { bg: 'rgba(239,68,68,0.08)',  icon: '#EF4444' },
    bet:         { bg: 'rgba(245,158,11,0.08)', icon: '#F59E0B' },
    refer:       { bg: 'rgba(16,185,129,0.08)', icon: '#10B981' },
  },
};

export const LIGHT_COLORS: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  overlay: 'rgba(15,23,42,0.45)',
  primary: '#F59E0B',
  primaryLight: '#FEF3C7',
  primaryDark: '#B45309',
  primaryGlow: 'rgba(245,158,11,0.15)',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderFocus: '#F59E0B',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#DBEAFE',
  inputBg: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  placeholder: '#94A3B8',
  navBg: '#FFFFFF',
  navBorder: '#E2E8F0',
  navActive: '#F59E0B',
  navInactive: '#94A3B8',
  goldGradient: ['#FBBF24', '#F59E0B', '#B45309'],
  secondary: '#3B82F6',
  textDark: '#0F172A',
  textGold: '#B45309',
  goldSolid: '#F59E0B',
  blueButton: '#3B82F6',
  actions: {
    withdraw:    { bg: '#FEF3C7', icon: '#D97706' },
    transfer:    { bg: '#FEF3C7', icon: '#D97706' },
    paylence:    { bg: '#D1FAE5', icon: '#10B981' },
    sell:        { bg: '#FEF3C7', icon: '#D97706' },
    giftcard:    { bg: '#FCE7F3', icon: '#EC4899' },
    topup:       { bg: '#DBEAFE', icon: '#3B82F6' },
    cable:       { bg: '#F3E8FF', icon: '#8B5CF6' },
    electricity: { bg: '#FEE2E2', icon: '#EF4444' },
    bet:         { bg: '#FEF3C7', icon: '#F59E0B' },
    refer:       { bg: '#D1FAE5', icon: '#10B981' },
  },
};

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  colors: DARK_COLORS,
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Read from localStorage or system theme
    const saved = localStorage.getItem('paylence_theme') as ThemeMode;
    if (saved) {
      setTheme(saved);
    } else {
      const matchDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(matchDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('paylence_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
export const COLORS = DARK_COLORS; // Static fallback
export function subscribeToTheme() { return () => {}; }
