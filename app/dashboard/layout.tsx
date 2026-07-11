"use client";

import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import { Home, TrendingUp, CreditCard, User, LogOut, ShieldAlert, Coins, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const mainTabRoutes = [
  '/dashboard/home',
  '/dashboard/wealth',
  '/dashboard/cards',
  '/dashboard/profile'
];

function getSubpageTitle(pathname: string) {
  if (pathname.includes('/dashboard/kyc')) return 'KYC Verification';
  if (pathname.includes('/dashboard/crypto')) return 'Paylence Crypto';
  if (pathname.includes('/dashboard/virtual_accounts')) return 'Virtual Accounts';
  if (pathname.includes('/dashboard/actions/transfer')) return 'Transfer';
  if (pathname.includes('/dashboard/actions/withdraw')) return 'Withdraw';
  if (pathname.includes('/dashboard/actions/paylence_transfer')) return 'Send to Paylence';
  if (pathname.includes('/dashboard/actions/giftcard')) return 'Gift Cards';
  if (pathname.includes('/dashboard/actions/topup')) return 'Airtime Top-up';
  if (pathname.includes('/dashboard/actions/cable')) return 'Cable TV';
  if (pathname.includes('/dashboard/actions/electricity')) return 'Electricity';
  if (pathname.includes('/dashboard/actions/bet')) return 'Betting Top-up';
  if (pathname.includes('/dashboard/actions/refer')) return 'Refer & Earn';
  
  const segment = pathname.split('/').pop() || '';
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace('_', ' ');
}

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
  const isMainTab = mainTabRoutes.includes(pathname);

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
      <div className={`flex-1 flex flex-col relative ${isMainTab ? 'pb-[62px]' : 'pb-0'} md:pb-0`}>
        
        {/* Mobile Header for Subpages */}
        {!isMainTab && (
          <div className="md:hidden">
            <header className="flex items-center justify-between px-4 h-[58px] border-b border-border bg-surface sticky top-0 z-40">
              <button 
                onClick={() => router.back()}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-surface-elevated flex items-center justify-center text-text-primary hover:scale-95 transition-transform cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              
              <div className="flex-1 pl-3 text-left">
                <h2 className="text-[15px] font-extrabold text-text-primary leading-tight">
                  {getSubpageTitle(pathname)}
                </h2>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Paylence Account
                </span>
              </div>

              <button className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0">
                <HelpCircle className="w-5.5 h-5.5" />
              </button>
            </header>
            <div className="h-[2.5px] bg-primary/35 w-full" />
          </div>
        )}

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
      {isMainTab && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around h-[62px] px-2 pb-safe">
          {TABS.filter(t => t.id !== 'crypto' && t.id !== 'kyc').map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className="flex flex-col items-center justify-center flex-1 h-full relative pt-1.5"
              >
                {/* Active pill indicator above the icon */}
                <div className={`absolute top-0 w-6 h-0.5 rounded-b-sm transition-colors ${
                  isActive ? 'bg-primary' : 'bg-transparent'
                }`} />
                
                <div className={`w-10 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary-light text-primary' : 'text-text-muted'
                }`}>
                  <Icon className="w-5.5 h-5.5 shrink-0" />
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
      )}

    </div>
  );
}
