"use client";

import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import { Home, TrendingUp, CreditCard, User, LogOut, ShieldAlert, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'home', label: 'Home', href: '/dashboard/home', icon: Home },
  { id: 'wealth', label: 'Wealth', href: '/dashboard/wealth', icon: TrendingUp },
  { id: 'cards', label: 'Cards', href: '/dashboard/cards', icon: CreditCard },
  { id: 'crypto', label: 'Crypto', href: '/dashboard/crypto', icon: Coins },
  { id: 'profile', label: 'Me', href: '/dashboard/profile', icon: User },
  { id: 'kyc', label: 'KYC', href: '/dashboard/kyc', icon: ShieldAlert },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userProfile, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-text-muted mt-2">Initializing session...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will trigger router redirect in AuthProvider
  }

  const initials = userProfile?.full_name
    ? userProfile.full_name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#040712] font-bold shadow-md shadow-amber-500/20">
            P
          </div>
          <span className="text-lg font-bold tracking-widest text-text-primary">PAYLENCE</span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-light text-primary border-l-4 border-primary'
                    : 'text-text-secondary hover:bg-border/30 hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info card in sidebar */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-text-primary truncate">{userProfile?.full_name || 'User'}</h4>
              <p className="text-xs text-text-muted truncate">{userProfile?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-border/40 hover:bg-border/60 text-text-primary transition-colors"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={() => logout()}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col relative pb-20 md:pb-0">
        
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-surface/40 backdrop-blur-md sticky top-0 z-40">
          <h1 className="text-lg font-bold capitalize text-text-primary">
            {pathname.split('/').pop()}
          </h1>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-success-bg text-success border border-success/10">
              {userProfile?.kyc_level || 'Level 1'}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 2. Mobile Bottom Navigation Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around h-[66px] px-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              {/* Active bar decoration */}
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute top-0 w-8 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              <div className={`p-1.5 rounded-xl transition-colors ${
                isActive ? 'bg-primary-light text-primary animate-pulse-subtle' : 'text-text-muted'
              }`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-text-muted'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
