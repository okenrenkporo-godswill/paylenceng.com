"use client";

import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
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
  { id: 'usdt', name: 'Tether',   symbol: 'USDT', usdValue: '₦1,485.00',        change: '+0.1%', changeType: 'up'   },
  { id: 'btc',  name: 'Bitcoin',  symbol: 'BTC',  usdValue: '₦101,700,000.00',  change: '-0.4%', changeType: 'down' },
  { id: 'eth',  name: 'Ethereum', symbol: 'ETH',  usdValue: '₦3,330,000.00',    change: '+1.8%', changeType: 'up'   },
  { id: 'bnb',  name: 'BNB',      symbol: 'BNB',  usdValue: '₦585,000.00',      change: '+0.6%', changeType: 'up'   },
  { id: 'sol',  name: 'Solana',   symbol: 'SOL',  usdValue: '₦235,000.00',      change: '-1.2%', changeType: 'down' },
];

const COIN_STYLES: Record<string, { color: string; bg: string }> = {
  USDT: { color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  BTC:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  ETH:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
  BNB:  { color: '#EAB308', bg: 'rgba(234,179,8,0.12)'   },
  SOL:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
};

function getCoinStyle(symbol: string) {
  return COIN_STYLES[symbol.toUpperCase()] ?? { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' };
}

export default function RatesSection() {
  const [rates, setRates] = useState<RateItem[]>(STATIC_RATES);

  const fetchLiveRates = async () => {
    try {
      const data = await apiClient.fetchRates();
      if (data && data.length > 0) {
        setRates(
          data.map((item: any) => ({
            id:         item.id,
            name:       item.name,
            symbol:     item.symbol,
            usdValue:   item.usdValue,
            change:     item.change,
            changeType: item.changeType,
          }))
        );
      }
    } catch {
      /* keep static data */
    }
  };

  useEffect(() => {
    fetchLiveRates();
    const id = setInterval(fetchLiveRates, 15_000);
    return () => clearInterval(id);
  }, []);

  // Triple the list so the loop never shows a gap
  const items = [...rates, ...rates, ...rates];

  return (
    <div className="my-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-text-primary">Live Rates</h4>
        <button className="text-xs font-semibold text-primary hover:underline">See All</button>
      </div>

      {/*
        KEY FIX:
        - The outer wrapper is `overflow-hidden` AND has `contain: layout style`
          so its children can never expand the page scroll width.
        - The inner track uses a CSS keyframe animation moving it left.
        - We DO NOT use `w-max` – instead we use `width: max-content`
          scoped inside a strictly contained, zero-height wrapper.
      */}
      <div
        className="relative py-1"
        style={{
          overflow: 'hidden',
          /* contain prevents this element's children from
             contributing to the document's scroll width */
          contain: 'layout style',
          width: '100%',
        }}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10"
          style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10"
          style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />

        {/* Scrolling track */}
        <div
          className="flex gap-3"
          style={{
            width: 'max-content',
            animation: 'ratesMarquee 35s linear infinite',
            willChange: 'transform',
          }}
        >
          {items.map((item, idx) => {
            const style = getCoinStyle(item.symbol);
            const isUp  = item.changeType === 'up';
            return (
              <div
                key={`${item.id}-${idx}`}
                className="shrink-0 bg-card-bg border border-card-border rounded-2xl p-3"
                style={{ width: '148px' }}
              >
                {/* Top row: coin badge + change */}
                <div className="flex justify-between items-center mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    {item.symbol[0]}
                  </div>
                  <div
                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                      isUp ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
                    }`}
                  >
                    {isUp
                      ? <TrendingUp  className="w-2.5 h-2.5" />
                      : <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{item.change}</span>
                  </div>
                </div>

                {/* Name / value */}
                <div className="text-sm font-bold text-text-primary">{item.symbol}</div>
                <div className="text-[10px] text-text-muted mt-0.5 mb-1">{item.name}</div>
                <div className="text-xs font-bold text-text-primary truncate mb-2">{item.usdValue}</div>

                {/* Rate row */}
                <div className="flex justify-between items-center bg-background rounded-lg py-1 px-1.5 text-[9px]">
                  <span className="text-text-muted font-medium">Rate</span>
                  <span className="text-text-primary font-bold">
                    {item.usdValue.split('/')[0]}/$
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyframe — scoped name avoids conflict with other marquees */}
      <style>{`
        @keyframes ratesMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
