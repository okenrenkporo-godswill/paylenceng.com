"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/navigation';
import RatesSection from './RatesSection';
import { 
  Wallet, Eye, EyeOff, Plus, Send, QrCode, MoreHorizontal, TrendingUp, 
  TrendingDown, ChevronRight, Bell, Wifi, Download, Zap, Coins, Gift, 
  Phone, Tv, Lightbulb, Globe, Users, ShieldAlert, ShieldCheck, HelpCircle 
} from 'lucide-react';

function getKycBadgeDetails(level: string = 'Level 0') {
  switch (level) {
    case 'Level 1':
      return {
        text: 'Level 1',
        icon: ShieldAlert,
        bgColor: 'bg-slate-200 dark:bg-slate-800',
        textColor: 'text-slate-600 dark:text-slate-400'
      };
    case 'Level 2':
      return {
        text: 'Level 2',
        icon: ShieldAlert,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-600 dark:text-amber-500'
      };
    case 'Level 3':
      return {
        text: 'Level 3',
        icon: ShieldCheck,
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-600 dark:text-emerald-500'
      };
    default:
      return {
        text: 'Level 0',
        icon: ShieldAlert,
        bgColor: 'bg-red-100 dark:bg-red-950/30',
        textColor: 'text-red-600 dark:text-red-500'
      };
  }
}

function getTxIcon(type: string) {
  switch (type) {
    case 'Deposit':
    case 'Transfer Received':
      return { icon: Download, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'Withdrawal':
    case 'Transfer Sent':
      return { icon: Send, color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'Sold Crypto':
      return { icon: Send, color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'Airtime Top-up':
      return { icon: Phone, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'Cable TV':
      return { icon: Tv, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    case 'Electricity':
      return { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    default:
      return { icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  }
}

export default function MobileHomeScreen() {
  const { balance, transactions, userProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [isMasked, setIsMasked] = useState(false);

  const firstName = userProfile?.full_name ? userProfile.full_name.split(' ')[0] : 'User';
  const recentTx = transactions.slice(0, 5);
  const badgeDetails = getKycBadgeDetails(userProfile?.kyc_level);
  const BadgeIcon = badgeDetails.icon;

  const formattedBalance = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(balance);

  const handleActionTrigger = (actionId: string, actionName: string) => {
    switch (actionId) {
      case 'withdraw':
        router.push('/dashboard/actions/withdraw');
        break;
      case 'transfer':
        router.push('/dashboard/actions/transfer');
        break;
      case 'paylence_transfer':
        router.push('/dashboard/actions/paylence_transfer');
        break;
      case 'crypto':
        router.push('/dashboard/crypto');
        break;
      case 'giftcard':
        router.push('/dashboard/actions/giftcard');
        break;
      case 'topup':
        router.push('/dashboard/actions/topup');
        break;
      case 'cable':
        router.push('/dashboard/actions/cable');
        break;
      case 'electricity':
        router.push('/dashboard/actions/electricity');
        break;
      case 'bet':
        router.push('/dashboard/actions/bet');
        break;
      case 'refer':
        router.push('/dashboard/actions/refer');
        break;
      default:
        break;
    }
  };

  const actions = [
    {
      id: 'withdraw',
      name: 'Withdraw',
      icon: Download,
      color: '#D97706',
      bg: '#FEF3C7',
      darkBg: 'rgba(245,158,11,0.08)',
      darkColor: '#F59E0B'
    },
    {
      id: 'transfer',
      name: 'Transfer',
      icon: Send,
      color: '#D97706',
      bg: '#FEF3C7',
      darkBg: 'rgba(245,158,11,0.08)',
      darkColor: '#F59E0B'
    },
    {
      id: 'paylence_transfer',
      name: 'Paylence',
      icon: Zap,
      color: '#10B981',
      bg: '#D1FAE5',
      darkBg: 'rgba(16,185,129,0.08)',
      darkColor: '#10B981'
    },
    {
      id: 'crypto',
      name: 'Crypto Exchange',
      icon: Coins,
      color: '#D97706',
      bg: '#FEF3C7',
      darkBg: 'rgba(245,158,11,0.08)',
      darkColor: '#F59E0B'
    },
    {
      id: 'giftcard',
      name: 'Giftcard',
      icon: Gift,
      color: '#EC4899',
      bg: '#FCE7F3',
      darkBg: 'rgba(236,72,153,0.08)',
      darkColor: '#EC4899'
    },
    {
      id: 'topup',
      name: 'Airtime',
      icon: Phone,
      color: '#3B82F6',
      bg: '#DBEAFE',
      darkBg: 'rgba(59,130,246,0.08)',
      darkColor: '#3B82F6'
    },
    {
      id: 'cable',
      name: 'Cable TV',
      icon: Tv,
      color: '#8B5CF6',
      bg: '#F3E8FF',
      darkBg: 'rgba(139,92,246,0.08)',
      darkColor: '#8B5CF6'
    },
    {
      id: 'electricity',
      name: 'Electricity',
      icon: Lightbulb,
      color: '#EF4444',
      bg: '#FEE2E2',
      darkBg: 'rgba(239,68,68,0.08)',
      darkColor: '#EF4444'
    },
    {
      id: 'bet',
      name: 'Bet Funding',
      icon: Globe,
      color: '#D97706',
      bg: '#FEF3C7',
      darkBg: 'rgba(245,158,11,0.08)',
      darkColor: '#F59E0B'
    },
    {
      id: 'refer',
      name: 'Refer & Earn',
      icon: Users,
      color: '#10B981',
      bg: '#D1FAE5',
      darkBg: 'rgba(16,185,129,0.08)',
      darkColor: '#10B981'
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-full overflow-x-hidden select-none">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between py-3 mt-2.5">
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-bold text-text-primary">Hello, {firstName} 👋</h2>
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-[8px] ${badgeDetails.bgColor} ${badgeDetails.textColor}`}>
                <BadgeIcon className="w-2.5 h-2.5" />
                <span className="text-[9px] font-bold">{badgeDetails.text}</span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted mt-0.5">{userProfile?.email || 'Sign in to view balance'}</span>
          </div>
        </div>

        <div className="flex items-center">
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text-primary ml-2 shadow-sm cursor-pointer"
          >
            <QrCode className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-text-primary ml-2 shadow-sm relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full" />
          </button>
        </div>
      </div>

      {/* 2. Gold Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-[22px] px-4 py-4 my-2 text-white bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 shadow-[0_8px_16px_rgba(234,179,8,0.3)] select-none w-full">
        {/* Decorative background circles */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-white/[0.06] -top-[60px] -right-[60px] pointer-events-none" />
        <div className="absolute w-[130px] h-[130px] rounded-full bg-white/[0.05] -bottom-[30px] -left-[30px] pointer-events-none" />

        {/* Top row: label + eye */}
        <div className="flex justify-between items-center mb-1.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-white/80" />
            <span className="text-xs text-white/85 font-medium">Total Balance</span>
          </div>
          <button 
            onClick={() => setIsMasked(!isMasked)}
            className="p-1.5 bg-white/15 rounded-lg transition-colors cursor-pointer"
          >
            {isMasked ? (
              <EyeOff className="w-4 h-4 text-white/85" />
            ) : (
              <Eye className="w-4 h-4 text-white/85" />
            )}
          </button>
        </div>

        {/* Balance amount */}
        <h3 className="text-[30px] font-extrabold tracking-wide text-white my-1 relative z-10 leading-normal">
          {isMasked ? '₦ ••••••••' : formattedBalance}
        </h3>

        {/* Account label */}
        {firstName && (
          <p className="text-[11px] text-white/65 mb-1 relative z-10 capitalize">
            {firstName.toLowerCase()}'s wallet
          </p>
        )}

        {/* Divider */}
        <div className="h-[1px] bg-white/20 my-3.5 relative z-10" />

        {/* Quick action buttons */}
        <div className="flex justify-between items-start relative z-10 gap-1">
          {/* Add Money */}
          <button
            onClick={() => router.push('/dashboard/virtual_accounts')}
            className="flex flex-col items-center flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
              <Plus className="w-4 h-4 text-amber-700 font-bold" />
            </div>
            <span className="text-[10px] font-semibold text-white/90 text-center leading-tight">Add Money</span>
          </button>

          {/* Send */}
          <button
            onClick={() => router.push('/dashboard/actions/transfer')}
            className="flex flex-col items-center flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
              <Send className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-[10px] font-semibold text-white/90 text-center leading-tight">Send</span>
          </button>

          {/* Receive */}
          <button
            onClick={() => router.push('/dashboard/virtual_accounts')}
            className="flex flex-col items-center flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
              <QrCode className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-[10px] font-semibold text-white/90 text-center leading-tight">Receive</span>
          </button>

          {/* More */}
          <button
            onClick={() => router.push('/dashboard/virtual_accounts')}
            className="flex flex-col items-center flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
              <MoreHorizontal className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-[10px] font-semibold text-white/90 text-center leading-tight">More</span>
          </button>
        </div>
      </div>

      {/* 3. Paylence Save Interest Ticker */}
      <div 
        onClick={() => router.push('/dashboard/wealth')}
        className="flex items-center justify-between p-4 rounded-[16px] bg-[#FFFBEB] dark:bg-amber-500/10 border border-[#FEF08A] dark:border-amber-500/20 my-1 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-text-primary">
          <TrendingUp className="w-4.5 h-4.5 text-primary shrink-0" />
          <span className="text-[12px] font-semibold text-text-secondary leading-normal">
            Earn up to 18% p.a. — Paylence Save & Wealth
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
      </div>

      {/* 4. Crypto Rates */}
      <RatesSection />

      {/* 5. Quick Actions Grid */}
      <div className="my-3.5">
        <h4 className="text-sm font-bold text-text-primary mb-3">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionTrigger(action.id, action.name)}
                className="flex flex-col items-center justify-center py-4 px-2 bg-surface border border-border rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all cursor-pointer select-none"
              >
                <div
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-2.5 transition-colors"
                  style={{
                    backgroundColor: colors.navBg === '#060918' ? action.darkBg : action.bg,
                    color: colors.navBg === '#060918' ? action.darkColor : action.color
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-text-secondary text-center truncate w-full">
                  {action.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Recent Transactions */}
      {recentTx.length > 0 && (
        <div className="bg-card-bg border border-card-border rounded-[20px] p-4 my-2 shadow-[0_2px_8px_rgba(100,116,139,0.04)]">
          <h4 className="text-sm font-bold text-text-primary mb-3">Recent Transactions</h4>
          <div className="divide-y divide-border/40">
            {recentTx.map((tx) => {
              const txStyle = getTxIcon(tx.type);
              const TxIcon = txStyle.icon;
              const isCredit = tx.type === 'Deposit' || tx.type === 'Transfer Received';

              return (
                <div key={tx.id} className="flex items-center py-2.5 gap-3 border-b border-border last:border-b-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDark ? 'bg-white/5 text-primary' : `${txStyle.bg} ${txStyle.color}`
                  }`}>
                    <TxIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[13px] font-semibold text-text-primary truncate">{tx.title}</h5>
                    <span className="text-[11px] text-text-muted mt-0.5 block">{tx.date}</span>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className={`text-[13px] font-bold ${
                      isCredit ? 'text-emerald-500' : 'text-text-primary'
                    }`}>
                      {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      tx.status === 'Completed' ? 'bg-emerald-500' 
                      : tx.status === 'Pending' ? 'bg-amber-500' 
                      : 'bg-danger'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Virtual Card Banners */}
      <div className="my-2.5 pb-5 space-y-4">
        {/* Banner 1: Virtual Card Promo */}
        <div className="relative overflow-hidden rounded-[20px] p-5 flex flex-row items-center justify-between bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-[0_4px_8px_rgba(245,158,11,0.1)]">
          <div className="flex-1 pr-2.5">
            <h4 className="text-base font-bold text-[#1E293B] leading-tight">
              Get Your Virtual Dollar Card
            </h4>
            <p className="text-xs text-[#475569] mt-1 mb-3.5 font-medium">
              Apply now for instant approval
            </p>
            <button
              onClick={() => router.push('/dashboard/cards')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm select-none cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          <div className="w-[100px] flex items-center justify-center shrink-0">
            <div className="w-[110px] h-[70px] bg-[#0F172A] rounded-lg p-2 flex flex-col justify-between shadow-lg rotate-[-8deg] border border-white/5 select-none">
              <div className="flex justify-between items-center">
                <Wifi className="w-3 h-3 text-white rotate-90" />
                <div className="w-3.5 h-2.5 bg-amber-400 rounded-[2px]" />
              </div>
              <div>
                <div className="text-[7px] font-medium text-slate-400 uppercase tracking-wider">
                  Virtual Card
                </div>
                <div className="text-[8px] font-bold text-white leading-none mt-0.5">
                  Paylence
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner 2: Fund Bet Wallet */}
        <div 
          onClick={() => router.push('/dashboard/actions/bet')}
          className={`flex items-center justify-between p-5 rounded-[20px] border ${
            isDark 
              ? 'bg-surface-elevated border-border' 
              : 'bg-[#FEF3C7] border-[#FDE68A]'
          } cursor-pointer`}
        >
          <div className="flex-1">
            <h4 className={`text-base font-bold ${isDark ? 'text-text-primary' : 'text-[#78350F]'}`}>
              Fund your Bet Wallet
            </h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-text-secondary' : 'text-[#92400E]'}`}>
              on the Paylence App
            </p>
          </div>
          
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-primary-light text-primary' : 'bg-[#FDE68A] text-[#D97706]'
          } shrink-0`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

    </div>
  );
}
