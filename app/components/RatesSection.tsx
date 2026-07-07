"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../services/api';

interface RateItem {
  id: string;
  name: string;
  symbol: string;
  usdValue: string;
  change: string;
  changeType: 'up' | 'down';
}

const STATIC_RATES: RateItem[] = [
  { id: 'usdt', name: 'Tether', symbol: 'USDT', usdValue: '₦1,485.00', change: '+0.1%', changeType: 'up' },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', usdValue: '₦101,700,000.00', change: '-0.4%', changeType: 'down' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', usdValue: '₦3,330,000.00', change: '+1.8%', changeType: 'up' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', usdValue: '₦585,000.00', change: '+0.6%', changeType: 'up' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', usdValue: '₦235,000.00', change: '-1.2%', changeType: 'down' },
];

export default function RatesSection() {
  const { colors } = useTheme();
  const [rates, setRates] = useState<RateItem[]>(STATIC_RATES);

  const fetchLiveRates = async () => {
    try {
      const data = await apiClient.fetchRates();
      if (data && data.length > 0) {
        const mapped: RateItem[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          usdValue: item.usdValue,
          change: item.change,
          changeType: item.changeType,
        }));
        setRates(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch live crypto rates:', err);
    }
  };

  useEffect(() => {
    fetchLiveRates();
    const interval = setInterval(fetchLiveRates, 15000);
    return () => clearInterval(interval);
  }, []);

  const getCoinStyle = (symbol: string) => {
    const sym = symbol.toUpperCase();
    if (sym === 'USDT') return { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'USDT' };
    if (sym === 'BTC') return { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'BTC' };
    if (sym === 'ETH') return { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'ETH' };
    if (sym === 'BNB') return { color: '#EAB308', bg: 'rgba(234,179,8,0.12)', label: 'BNB' };
    if (sym === 'SOL') return { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'SOL' };
    return { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: sym };
  };

  // Duplicate items for infinite marquee scrolling visual continuity
  const tickerItems = [...rates, ...rates, ...rates];

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-text-primary">Live Rates</h4>
        <button className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline">
          See All
        </button>
      </div>

      {/* Marquee View */}
      <div className="relative w-full overflow-x-hidden group py-1">
        
        {/* Gradients on edges for smooth visual fading */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex w-max gap-3 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
          {tickerItems.map((item, index) => {
            const coinStyle = getCoinStyle(item.symbol);
            const isUp = item.changeType === 'up';

            return (
              <div
                key={`${item.id}-${index}`}
                className="w-[170px] shrink-0 bg-card-bg border border-card-border p-3.5 rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors hover:border-primary/30"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                    style={{ backgroundColor: coinStyle.bg, color: coinStyle.color }}
                  >
                    {coinStyle.label[0]}
                  </div>

                  <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                    isUp ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
                  }`}>
                    {isUp ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    <span>{item.change}</span>
                  </div>
                </div>

                <div className="text-sm font-bold text-text-primary">{item.symbol}</div>
                <div className="text-[10px] text-text-muted mt-0.5 mb-1.5">{item.name}</div>
                <div className="text-xs font-bold text-text-primary mb-2 truncate">{item.usdValue}</div>

                <div className="flex justify-between items-center bg-background rounded-lg py-1 px-1.5 text-[9px]">
                  <span className="text-text-muted font-medium">Rate</span>
                  <span className="text-text-primary font-bold">
                    ₦{item.usdValue.replace('₦', '').split('/')[0]}/$
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add inline stylesheet for marquee keyframe animation if not already handled */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
