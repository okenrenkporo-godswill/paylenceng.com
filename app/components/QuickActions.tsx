"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Send, Zap, Coins, Gift, Phone, Tv, Lightbulb, Globe, Users 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface QuickActionsProps {
  onActionPress: (actionId: string, actionName: string) => void;
}

export default function QuickActions({ onActionPress }: QuickActionsProps) {
  const { colors } = useTheme();

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
    <div className="my-6">
      <h4 className="text-sm font-bold text-text-primary mb-3">Quick Actions</h4>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              key={action.id}
              onClick={() => onActionPress(action.id, action.name)}
              className="flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:border-primary/20 transition-all cursor-pointer select-none"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-colors"
                style={{
                  backgroundColor: colors.navBg === '#060918' ? action.darkBg : action.bg,
                  color: colors.navBg === '#060918' ? action.darkColor : action.color
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-text-secondary text-center truncate w-full">
                {action.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
