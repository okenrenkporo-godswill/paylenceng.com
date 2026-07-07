"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff, Plus, Send, QrCode, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface BalanceCardProps {
  balance: number;
  userName?: string;
  onSendPress?: () => void;
  onAddMoneyPress?: () => void;
  onReceivePress?: () => void;
  onMorePress?: () => void;
}

export default function BalanceCard({
  balance,
  userName,
  onSendPress,
  onAddMoneyPress,
  onReceivePress,
  onMorePress,
}: BalanceCardProps) {
  const { isDark } = useTheme();
  const [isMasked, setIsMasked] = useState(false);

  const formattedBalance = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(balance);

  const handleToggleMask = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMasked(!isMasked);
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_8px_20px_rgba(245,158,11,0.2)] select-none">
      
      {/* Decorative circles */}
      <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-[-30px] left-[-30px] w-[130px] h-[130px] rounded-full bg-white/5 pointer-events-none" />

      {/* Card Header */}
      <div className="flex justify-between items-center mb-1.5 relative z-10">
        <div className="flex items-center gap-2 text-white/80">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Total Balance</span>
        </div>
        <button
          onClick={handleToggleMask}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="Toggle Mask"
        >
          {isMasked ? (
            <EyeOff className="w-4 h-4 text-white/90" />
          ) : (
            <Eye className="w-4 h-4 text-white/90" />
          )}
        </button>
      </div>

      {/* Balance Amount */}
      <h3 className="text-3xl font-extrabold tracking-wide my-1 relative z-10">
        {isMasked ? '₦ ••••••••' : formattedBalance}
      </h3>

      {/* Account Label */}
      {userName && (
        <p className="text-[11px] text-white/70 mb-1 relative z-10 capitalize">
          {userName}'s Wallet
        </p>
      )}

      {/* Divider */}
      <div className="h-[1px] bg-white/15 my-4 relative z-10" />

      {/* Actions */}
      <div className="flex justify-between relative z-10 gap-2">
        
        {/* Add Money */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAddMoneyPress}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 font-bold" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">Add Money</span>
        </motion.button>

        {/* Send */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSendPress}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <Send className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">Send</span>
        </motion.button>

        {/* Receive */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onReceivePress}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">Receive</span>
        </motion.button>

        {/* More */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMorePress}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-white text-amber-600 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">More</span>
        </motion.button>

      </div>

    </div>
  );
}
