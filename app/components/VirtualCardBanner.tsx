"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface VirtualCardBannerProps {
  onApplyPress: () => void;
  onBetPress?: () => void;
}

export default function VirtualCardBanner({ onApplyPress, onBetPress }: VirtualCardBannerProps) {
  const { colors, isDark } = useTheme();

  return (
    <div className="my-4 flex flex-col gap-4">
      
      {/* Banner 1: Virtual Card Promo */}
      <div className="relative overflow-hidden rounded-[20px] p-6 flex flex-row items-center justify-between bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.1)]">
        
        <div className="flex-1 pr-4">
          <h4 className="text-base font-extrabold text-[#1E293B] leading-tight">
            Get Your Virtual Dollar Card
          </h4>
          <p className="text-xs text-[#475569] mt-1 mb-4 font-medium">
            Apply now for instant approval
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onApplyPress}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm select-none cursor-pointer"
          >
            Apply Now
          </motion.button>
        </div>

        {/* Mock Card Graphic */}
        <div className="w-[110px] flex items-center justify-center shrink-0">
          <div className="w-[110px] h-[70px] bg-slate-900 rounded-lg p-2 flex flex-col justify-between shadow-lg rotate-[-8deg] border border-white/5 select-none">
            <div className="flex justify-between items-center">
              <Wifi className="w-3 h-3 text-white/80 rotate-90" />
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
        onClick={onBetPress}
        className="flex items-center justify-between p-5 rounded-[20px] border border-card-border bg-surface-elevated dark:bg-card-bg hover:border-primary/20 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
      >
        <div className="flex-1">
          <h4 className="text-sm font-bold text-text-primary">
            Fund your Bet Wallet
          </h4>
          <p className="text-xs text-text-muted mt-1">
            on the Paylence App
          </p>
        </div>
        
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-light text-primary">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}
