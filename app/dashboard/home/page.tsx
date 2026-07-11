"use client";

import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import BalanceCard from '../../components/BalanceCard';
import RatesSection from '../../components/RatesSection';
import QuickActions from '../../components/QuickActions';
import VirtualCardBanner from '../../components/VirtualCardBanner';
import MobileHomeScreen from '../../components/MobileHomeScreen';
import { QrCode, Bell, ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning, TrendingUp, ArrowUpRight, ArrowDownLeft, Phone, Tv, Zap, RefreshCw, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

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
        icon: ShieldWarning,
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
      return { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'Withdrawal':
    case 'Transfer Sent':
      return { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'Sold Crypto':
      return { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'Airtime Top-up':
      return { icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'Cable TV':
      return { icon: Tv, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    case 'Electricity':
      return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    default:
      return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  }
}

export default function HomePage() {
  const { balance, transactions, userProfile, syncWithBackend } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  const firstName = userProfile?.full_name ? userProfile.full_name.split(' ')[0] : 'User';
  const recentTx = transactions.slice(0, 5);
  const badgeDetails = getKycBadgeDetails(userProfile?.kyc_level);
  const BadgeIcon = badgeDetails.icon;

  const handleActionTrigger = (actionId: string) => {
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

  return (
    <>
      {/* Mobile view - Exact recreation of Expo HomeScreen */}
      <div className="block md:hidden">
        <MobileHomeScreen />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block flex flex-col gap-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">Hello, {firstName} 👋</h2>
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeDetails.bgColor} ${badgeDetails.textColor}`}>
                <BadgeIcon className="w-3 h-3" />
                <span>{badgeDetails.text}</span>
              </div>
            </div>
            <span className="text-xs text-text-muted mt-1">{userProfile?.email}</span>
          </div>

          {/* Qr & Notifications buttons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => router.push('/dashboard/profile')}
              className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-primary hover:border-primary/20 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            >
              <QrCode className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/profile')}
              className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-text-primary hover:border-primary/20 transition-all cursor-pointer relative shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          userName={firstName}
          onSendPress={() => router.push('/dashboard/actions/transfer')}
          onAddMoneyPress={() => router.push('/dashboard/virtual_accounts')}
          onReceivePress={() => router.push('/dashboard/virtual_accounts')}
          onMorePress={() => router.push('/dashboard/virtual_accounts')}
        />

        {/* Wealth Banner */}
        <div 
          onClick={() => router.push('/dashboard/wealth')}
          className="flex items-center justify-between p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-text-primary">
            <TrendingUp className="w-4.5 h-4.5 text-primary" />
            <span className="text-xs font-bold text-text-secondary">
              Earn up to 18% p.a. — Paylence Save & Wealth
            </span>
          </div>
          <span className="text-xs text-text-muted">➔</span>
        </div>

        {/* Crypto Rates Ticker */}
        <RatesSection />

        {/* Quick Actions Grid */}
        <QuickActions onActionPress={handleActionTrigger} />

        {/* Recent Transactions list */}
        {recentTx.length > 0 && (
          <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
            <h4 className="text-sm font-extrabold text-text-primary mb-3">Recent Transactions</h4>
            
            <div className="divide-y divide-border/40">
              {recentTx.map((tx) => {
                const txStyle = getTxIcon(tx.type);
                const TxIcon = txStyle.icon;
                const isCredit = tx.type === 'Deposit' || tx.type === 'Transfer Received';

                return (
                  <div key={tx.id} className="flex items-center py-3.5 gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txStyle.bg} ${txStyle.color}`}>
                      <TxIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <h5 className="text-xs font-bold text-text-primary truncate">{tx.title}</h5>
                      <span className="text-[10px] text-text-muted mt-1 block">{tx.date}</span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-xs font-black ${
                        isCredit ? 'text-emerald-500' : 'text-text-primary'
                      }`}>
                        {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        tx.status === 'Completed' ? 'bg-emerald-500' : tx.status === 'Pending' ? 'bg-amber-500' : 'bg-danger'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Virtual Cards Banner */}
        <VirtualCardBanner 
          onApplyPress={() => router.push('/dashboard/cards')}
          onBetPress={() => router.push('/dashboard/actions/bet')}
        />

      </div>
    </>
  );
}
