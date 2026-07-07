"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Lock, ShieldCheck, RefreshCw, Plus, ArrowUp, Calendar, ChevronRight, Calculator, CalendarDays } from 'lucide-react';
import { Button, Input } from '../../components/UI';
import { Modal } from '@heroui/react';
import apiClient from '../../services/api';

const BAR_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WealthPage() {
  const { balance: mainBalance, syncWithBackend } = useAuth();
  const { colors, isDark } = useTheme();

  // Savings API state
  const [savings, setSavings] = useState({
    wealth_balance: 0.0,
    fixed_balance: 0.0,
    safebox_balance: 0.0,
    cumulative_interest: 0.0,
    active_locks: [] as any[],
    auto_save_plan: null as any
  });
  const [isLoadingSavings, setIsLoadingSavings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculator inputs
  const [calcAmount, setCalcAmount] = useState('100000');
  const [calcDuration, setCalcDuration] = useState<30 | 90 | 365>(90);

  // Modal controls
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onOpenChange = () => setIsOpen(!isOpen);
  const [activeModal, setActiveModal] = useState<null | 'details' | 'fund' | 'withdraw' | 'lock' | 'autosave'>(null);
  const [selectedProduct, setSelectedProduct] = useState<'wealth' | 'fixed' | 'safebox'>('wealth');

  // Transaction Inputs
  const [amountInput, setAmountInput] = useState('');
  const [lockDuration, setLockDuration] = useState<30 | 90 | 365>(90);
  const [autoSaveFreq, setAutoSaveFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [autoSaveAmount, setAutoSaveAmount] = useState('5000');

  // Chart interactivity
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(0);

  const loadSavings = async () => {
    try {
      setIsLoadingSavings(true);
      const data = await apiClient.fetchSavings();
      if (data) {
        setSavings({
          wealth_balance: data.wealth_balance || 0.0,
          fixed_balance: data.fixed_balance || 0.0,
          safebox_balance: data.safebox_balance || 0.0,
          cumulative_interest: data.cumulative_interest || 0.0,
          active_locks: data.active_locks || [],
          auto_save_plan: data.auto_save_plan
        });
      }
    } catch (err) {
      console.warn('Failed to load savings balances:', err);
    } finally {
      setIsLoadingSavings(false);
    }
  };

  useEffect(() => {
    loadSavings();
  }, [mainBalance]);

  const openSheet = (type: 'details' | 'fund' | 'withdraw' | 'lock' | 'autosave', product?: 'wealth' | 'fixed' | 'safebox') => {
    if (product) setSelectedProduct(product);
    setAmountInput('');
    setActiveModal(type);
    onOpen();
  };

  // Transaction Actions
  const submitFund = async () => {
    const val = parseFloat(amountInput) || 0;
    if (val <= 0) return alert('Please enter a valid amount.');
    if (val > mainBalance) return alert('Insufficient main wallet balance.');

    try {
      setIsSubmitting(true);
      const res = await apiClient.fundSavings(selectedProduct, val);
      alert(res.message || `Funded ₦${val.toLocaleString()} successfully!`);
      setAmountInput('');
      onOpenChange(); // Close modal
      syncWithBackend();
      loadSavings();
    } catch (err: any) {
      alert(err.message || 'Transfer failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitWithdraw = async () => {
    const val = parseFloat(amountInput) || 0;
    if (val <= 0) return alert('Please enter a valid amount.');
    
    const maxVal = selectedProduct === 'wealth' ? savings.wealth_balance
                 : selectedProduct === 'fixed' ? savings.fixed_balance
                 : savings.safebox_balance;
    
    if (val > maxVal) return alert('Insufficient savings balance.');

    try {
      setIsSubmitting(true);
      const res = await apiClient.withdrawSavings(selectedProduct, val);
      alert(res.message || `Withdrew ₦${val.toLocaleString()} successfully!`);
      setAmountInput('');
      onOpenChange(); // Close modal
      syncWithBackend();
      loadSavings();
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCreateLock = async () => {
    const val = parseFloat(amountInput) || 0;
    if (val <= 0) return alert('Please enter a valid amount.');
    if (val > mainBalance) return alert('Insufficient main wallet balance.');

    try {
      setIsSubmitting(true);
      const res = await apiClient.createFixedLock(val, lockDuration);
      alert(res.message || `Locked ₦${val.toLocaleString()} for ${lockDuration} days successfully!`);
      setAmountInput('');
      onOpenChange(); // Close modal
      syncWithBackend();
      loadSavings();
    } catch (err: any) {
      alert(err.message || 'Establish lock failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAutoSave = async (active: boolean) => {
    const val = parseFloat(autoSaveAmount) || 0;
    if (active && val <= 0) return alert('Please enter a valid auto-save amount.');

    try {
      setIsSubmitting(true);
      const res = await apiClient.updateAutoSave(val, autoSaveFreq, active);
      alert(res.message || (active ? `Auto-save plan scheduled at ₦${val.toLocaleString()} ${autoSaveFreq}!` : 'Auto-save plan cancelled.'));
      onOpenChange(); // Close modal
      loadSavings();
    } catch (err: any) {
      alert(err.message || 'Failed to update auto-save details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculator Logic
  const calcRate = calcDuration === 30 ? 0.15 : calcDuration === 90 ? 0.165 : 0.18;
  const calcAmt  = parseFloat(calcAmount) || 0;
  const calcEarn = calcAmt * calcRate * (calcDuration / 365);
  const calcMaturity = calcAmt + calcEarn;

  const totalSavings = savings.wealth_balance + savings.fixed_balance + savings.safebox_balance;
  const dailyRate = (savings.wealth_balance * 0.15 + savings.fixed_balance * 0.18 + savings.safebox_balance * 0.165) / 365;
  const annualRate = totalSavings > 0
    ? ((savings.wealth_balance * 15.0 + savings.fixed_balance * 18.0 + savings.safebox_balance * 16.5) / totalSavings)
    : 15.0;

  const getChartDayAmount = (index: number) => {
    const scale = [0.85, 0.90, 0.95, 0.98, 1.0, 1.02, 0.99][index] || 1;
    return dailyRate * scale;
  };

  const generateInterestLogs = () => {
    if (dailyRate <= 0) return [];
    const logs = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const logDate = new Date(now);
      logDate.setDate(now.getDate() - i);
      let dateText = '';
      if (i === 0) dateText = 'Today, 06:00 AM';
      else if (i === 1) dateText = 'Yesterday, 06:00 AM';
      else dateText = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', 06:00 AM';
      
      logs.push({
        id: `interest-log-${i}`,
        date: dateText,
        amount: dailyRate * (1 - i * 0.002)
      });
    }
    return logs;
  };

  const PRODUCTS = [
    {
      id: 'wealth' as const,
      title: 'Paylence Wealth',
      subtitle: `Current Balance: ₦${savings.wealth_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      rate: '15.0%',
      period: 'p.a.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      icon: TrendingUp,
      badge: 'Flexible',
      desc: 'Earn daily interest on your flexible balance. Withdraw anytime without penalty or loss of accrued earnings.'
    },
    {
      id: 'fixed' as const,
      title: 'Fixed Deposit',
      subtitle: `Current Balance: ₦${savings.fixed_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      rate: '18.0%',
      period: 'p.a.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      icon: Lock,
      badge: 'Best Rate',
      desc: 'Lock up your capital for a chosen period to yield premium returns. Perfect for long-term investments.'
    },
    {
      id: 'safebox' as const,
      title: 'SafeBox',
      subtitle: `Current Balance: ₦${savings.safebox_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      rate: '16.5%',
      period: 'p.a.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      icon: ShieldCheck,
      badge: 'Auto-Save',
      desc: 'Save automatically from your main wallet at regular intervals. Build a solid financial cushion effortlessly.'
    },
  ];

  const activeProductData = PRODUCTS.find((p) => p.id === selectedProduct);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8 select-none">
      
      {/* 1. Hero Card */}
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-slate-900 shadow-xl border border-border/10">
        <div className="absolute top-[-60px] right-[-60px] w-[180px] h-[180px] rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-30px] w-[100px] h-[100px] rounded-full bg-white/[0.03] pointer-events-none" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Savings Balance</span>
            {isLoadingSavings ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mt-2" />
            ) : (
              <h3 className="text-3xl font-extrabold tracking-wide mt-1">
                ₦{totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-[#040712] shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{annualRate.toFixed(2)}% p.a.</span>
          </div>
        </div>

        <div className="h-[1px] bg-slate-800 my-4 relative z-10" />

        <div className="grid grid-cols-3 gap-2 relative z-10 text-center sm:text-left">
          <div>
            <span className="text-[10px] text-slate-400 block">Today's Earnings</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-1 block">
              +₦{dailyRate.toFixed(2)}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-400 block">Cumulative Earnings</span>
            <span className="text-xs sm:text-sm font-bold text-amber-400 mt-1 block">
              +₦{savings.cumulative_interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-400 block">Main Wallet</span>
            <span className="text-xs sm:text-sm font-bold text-white mt-1 block">
              ₦{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick savings Actions */}
      <div className="grid grid-cols-4 gap-3 bg-surface border border-border p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <button
          onClick={() => openSheet('fund', 'wealth')}
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary">Fund</span>
        </button>

        <button
          onClick={() => openSheet('withdraw', 'wealth')}
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowUp className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary">Withdraw</span>
        </button>

        <button
          onClick={() => openSheet('autosave', 'safebox')}
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary">Auto-Save</span>
        </button>

        <button
          onClick={() => {
            loadSavings();
            syncWithBackend();
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <RefreshCw className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary">Refresh</span>
        </button>
      </div>

      {/* 3. Weekly chart logs */}
      <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <h4 className="text-sm font-extrabold text-text-primary mb-3">Weekly Earnings Chart</h4>
        
        {/* Interactive tooltip */}
        <div className="h-6 flex items-center justify-center text-xs font-semibold text-primary mb-4 bg-primary-light rounded-lg py-1 px-3 w-fit mx-auto border border-primary/10">
          {selectedBarIndex !== null && (
            <span>
              {BAR_DAYS[selectedBarIndex]}: {dailyRate > 0 ? `+₦${getChartDayAmount(selectedBarIndex).toFixed(2)} interest earned` : 'No active earnings'}
            </span>
          )}
        </div>

        {/* Bar chart SVG / HTML */}
        <div className="flex justify-between items-end h-[100px] px-4 pt-2">
          {[65, 72, 80, 88, 95, 100, 94].map((h, i) => {
            const isSelected = selectedBarIndex === i;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedBarIndex(i)}
                className="flex flex-col items-center flex-1 cursor-pointer group"
              >
                <div className="w-8 bg-border/40 rounded-t-lg h-[80px] flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: dailyRate > 0 ? `${h}%` : '8%' }}
                    className={`w-full rounded-t-lg transition-colors ${
                      isSelected ? 'bg-primary' : 'bg-primary/50 group-hover:bg-primary/75'
                    }`}
                  />
                </div>
                <span className={`text-[10px] mt-2 font-bold transition-colors ${
                  isSelected ? 'text-primary' : 'text-text-muted'
                }`}>
                  {BAR_DAYS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Savings Products List */}
      <div className="space-y-3.5">
        <h4 className="text-sm font-extrabold text-text-primary">Savings & Wealth Products</h4>
        
        {PRODUCTS.map((p) => {
          const ProductIcon = p.icon;
          const isActive = selectedProduct === p.id;
          
          return (
            <div
              key={p.id}
              onClick={() => openSheet('details', p.id)}
              className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
                isActive ? 'border-primary bg-primary-light/10 shadow-sm' : 'border-border bg-surface hover:border-primary/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.bg} ${p.color}`}>
                <ProductIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary">{p.title}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.color}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mt-1 truncate">{p.subtitle}</p>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-black ${p.color}`}>{p.rate}</span>
                  <span className="text-[9px] text-text-muted font-medium">{p.period}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Earnings Calculator */}
      <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <h4 className="text-sm font-extrabold text-text-primary mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span>Savings Estimator</span>
        </h4>

        <div className="space-y-4">
          <Input
            label="Amount to Save (₦)"
            placeholder="e.g. 100,000"
            labelPlacement="outside"
            type="number"
            value={calcAmount}
            onValueChange={setCalcAmount}
            variant="bordered"
            classNames={{
              inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl",
              label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
            }}
          />

          <div className="space-y-2">
            <span className="text-text-secondary font-bold text-xs uppercase tracking-wider block">Lock Duration</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 30, rate: '15.0%' },
                { days: 90, rate: '16.5%' },
                { days: 365, rate: '18.0%' }
              ].map((d) => {
                const active = calcDuration === d.days;
                return (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setCalcDuration(d.days as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      active 
                        ? 'border-primary bg-primary-light/20 text-primary shadow-sm'
                        : 'border-border bg-input-bg hover:border-primary/20 text-text-secondary'
                    }`}
                  >
                    <span className="text-xs font-bold">{d.days} days</span>
                    <span className="text-[10px] font-medium text-text-muted mt-1">{d.rate}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculator Results */}
          <div className="p-4 rounded-2xl bg-success-bg/20 dark:bg-success-bg/5 border border-success/15 grid grid-cols-2 gap-4 text-center">
            <div className="border-r border-border/40">
              <span className="text-[10px] text-text-muted font-bold block">Interest Earned</span>
              <span className="text-sm sm:text-base font-extrabold text-success mt-1 block">
                +₦{calcEarn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted font-bold block">Maturity Value</span>
              <span className="text-sm sm:text-base font-extrabold text-text-primary mt-1 block">
                ₦{calcMaturity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Button
            onPress={() => {
              if (selectedProduct === 'fixed') {
                setAmountInput(calcAmount);
                setLockDuration(calcDuration);
                openSheet('lock');
              } else {
                setAmountInput(calcAmount);
                openSheet('fund');
              }
            }}
            className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-500/20"
          >
            Start Saving Now
          </Button>
        </div>
      </div>

      {/* 6. Daily Earnings Log */}
      <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <h4 className="text-sm font-extrabold text-text-primary mb-3">Daily Earnings Log</h4>
        
        {dailyRate <= 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
            <CalendarDays className="w-10 h-10 text-text-muted" />
            <p className="text-xs text-text-muted max-w-[280px] leading-relaxed">
              No active interest accrual. Fund one of our savings products to begin receiving daily credits!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 max-h-[220px] overflow-y-auto pr-1">
            {generateInterestLogs().map((log) => (
              <div key={log.id} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <h6 className="text-xs font-bold text-text-primary">Daily Interest Credit</h6>
                    <span className="text-[10px] text-text-muted mt-0.5 block">{log.date}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-500">
                  +₦{log.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal dialog overlay */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog className="select-none text-text-primary outline-none">
              {({ close }) => (
                <>
                  
                  {/* Overlay type: DETAILS */}
                  {activeModal === 'details' && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                        {activeProductData?.title}
                      </Modal.Header>
                      <Modal.Body className="pb-6">
                        <p className="text-xs text-text-muted leading-relaxed mb-4">
                          {activeProductData?.desc}
                        </p>

                        <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center justify-center mb-6">
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Current Balance</span>
                          <h4 className="text-2xl font-black text-primary mt-1">
                            ₦{(selectedProduct === 'wealth' ? savings.wealth_balance
                              : selectedProduct === 'fixed' ? savings.fixed_balance
                              : savings.safebox_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h4>
                          <span className="text-[10px] text-text-muted font-bold mt-2">
                            Interest Rate: <span className="text-success font-black">{activeProductData?.rate} {activeProductData?.period}</span>
                          </span>
                        </div>

                        {/* Product specific logs */}
                        {selectedProduct === 'fixed' && (
                          <div className="space-y-2">
                            <span className="text-xs font-extrabold text-text-primary block">Active Fixed Deposits</span>
                            {savings.active_locks.length === 0 ? (
                              <div className="border border-border/80 border-dashed rounded-xl py-6 text-center text-xs text-text-muted">
                                No locked deposits active.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                {savings.active_locks.map((lock: any, index: number) => (
                                  <div key={lock.id || index} className="p-3 border border-border bg-background rounded-xl flex justify-between items-center text-xs">
                                    <div>
                                      <h6 className="font-extrabold text-text-primary">₦{lock.amount.toLocaleString()}</h6>
                                      <span className="text-[10px] text-text-muted mt-0.5 block">Locked for {lock.duration_days} days (Matures: {new Date(lock.matures_at).toLocaleDateString()})</span>
                                    </div>
                                    <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-extrabold rounded-md text-[10px]">
                                      {(lock.interest_rate * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {selectedProduct === 'safebox' && (
                          <div className="space-y-2">
                            <span className="text-xs font-extrabold text-text-primary block">Auto-Save Status</span>
                            {savings.auto_save_plan ? (
                              <div className="p-4 border border-border rounded-xl flex justify-between items-center bg-background">
                                <div>
                                  <h6 className="text-xs font-bold text-text-primary">Plan Active</h6>
                                  <span className="text-[10px] text-text-muted mt-1 block">Saving ₦{savings.auto_save_plan.amount.toLocaleString()} {savings.auto_save_plan.frequency}</span>
                                </div>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  className="font-bold text-[10px]"
                                  isLoading={isSubmitting}
                                  onPress={() => submitAutoSave(false)}
                                >
                                  Cancel Plan
                                </Button>
                              </div>
                            ) : (
                              <div className="border border-border/80 border-dashed rounded-xl py-6 text-center text-xs text-text-muted">
                                Auto-saving is not configured.
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-6">
                          {selectedProduct === 'fixed' ? (
                            <Button
                              onPress={() => openSheet('lock')}
                              className="col-span-2 h-11 rounded-xl font-bold text-white bg-primary shadow-md shadow-primary/20"
                            >
                              Create New Lock
                            </Button>
                          ) : selectedProduct === 'safebox' ? (
                            <>
                              <Button
                                onPress={() => openSheet('autosave')}
                                className="h-11 rounded-xl font-bold text-white bg-primary shadow-md shadow-primary/20"
                              >
                                Configure
                              </Button>
                              <Button
                                onPress={() => openSheet('withdraw')}
                                variant="bordered"
                                className="h-11 rounded-xl font-bold text-text-primary border-border hover:border-primary/20"
                              >
                                Withdraw
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onPress={() => openSheet('fund')}
                                className="h-11 rounded-xl font-bold text-white bg-primary shadow-md shadow-primary/20"
                              >
                                Fund Savings
                              </Button>
                              <Button
                                onPress={() => openSheet('withdraw')}
                                variant="bordered"
                                className="h-11 rounded-xl font-bold text-text-primary border-border hover:border-primary/20"
                              >
                                Withdraw
                              </Button>
                            </>
                          )}
                        </div>
                      </Modal.Body>
                    </>
                  )}

                  {/* Overlay type: FUND / WITHDRAW */}
                  {(activeModal === 'fund' || activeModal === 'withdraw') && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                        {activeModal === 'fund' ? 'Fund Savings' : 'Withdraw Savings'}
                      </Modal.Header>
                      <Modal.Body className="pb-6 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Product Account</span>
                          <div className="py-2.5 px-4 bg-input-bg rounded-xl border border-border/40 font-bold text-xs">
                            {activeProductData?.title}
                          </div>
                        </div>

                        <Input
                          label="Amount (₦)"
                          placeholder="e.g. 5,000"
                          labelPlacement="outside"
                          type="number"
                          value={amountInput}
                          onValueChange={setAmountInput}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl",
                            label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                          }}
                        />

                        <span className="text-[10px] text-text-muted font-bold block">
                          {activeModal === 'fund'
                            ? `Main Wallet Available: ₦${mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : `Savings Available: ₦${(selectedProduct === 'wealth' ? savings.wealth_balance : (selectedProduct === 'fixed' ? savings.fixed_balance : savings.safebox_balance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          }
                        </span>

                        <div className="pt-4 flex gap-3">
                          <Button
                            onPress={() => openSheet('details')}
                            variant="bordered"
                            className="flex-1 h-11 rounded-xl font-bold text-text-primary border-border"
                          >
                            Cancel
                          </Button>
                          <Button
                            isLoading={isSubmitting}
                            onPress={activeModal === 'fund' ? submitFund : submitWithdraw}
                            className="flex-1 h-11 rounded-xl font-bold text-white bg-primary shadow-md shadow-primary/20"
                          >
                            Confirm
                          </Button>
                        </div>
                      </Modal.Body>
                    </>
                  )}

                  {/* Overlay type: FIXED LOCK */}
                  {activeModal === 'lock' && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                        Create Fixed Deposit Lock
                      </Modal.Header>
                      <Modal.Body className="pb-6 space-y-4">
                        <Input
                          label="Amount to Lock (₦)"
                          placeholder="e.g. 50,000"
                          labelPlacement="outside"
                          type="number"
                          value={amountInput}
                          onValueChange={setAmountInput}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl",
                            label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                          }}
                        />

                        <div className="space-y-2">
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Lock Period</span>
                          <div className="grid grid-cols-3 gap-2">
                            {([30, 90, 365] as const).map((d) => {
                              const active = lockDuration === d;
                              const rateLabel = d === 30 ? '15.0%' : d === 90 ? '16.5%' : '18.0%';
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setLockDuration(d)}
                                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                    active
                                      ? 'border-primary bg-primary-light/20 text-primary shadow-sm'
                                      : 'border-border bg-input-bg hover:border-primary/20 text-text-secondary'
                                  }`}
                                >
                                  <span className="text-xs font-bold">{d} days</span>
                                  <span className="text-[9px] text-text-muted mt-0.5">{rateLabel}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <span className="text-[10px] text-text-muted font-bold block">
                          Main Wallet Available: ₦{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>

                        <div className="pt-4 flex gap-3">
                          <Button
                            onPress={() => openSheet('details')}
                            variant="bordered"
                            className="flex-1 h-11 rounded-xl font-bold text-text-primary border-border"
                          >
                            Cancel
                          </Button>
                          <Button
                            isLoading={isSubmitting}
                            onPress={submitCreateLock}
                            className="flex-1 h-11 rounded-xl font-bold text-white bg-primary shadow-md shadow-primary/20"
                          >
                            Create Lock
                          </Button>
                        </div>
                      </Modal.Body>
                    </>
                  )}

                  {/* Overlay type: AUTOSAVE SETUP */}
                  {activeModal === 'autosave' && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                        Configure SafeBox Auto-Save
                      </Modal.Header>
                      <Modal.Body className="pb-6 space-y-4">
                        <Input
                          label="Auto-Save Amount (₦)"
                          placeholder="e.g. 2,000"
                          labelPlacement="outside"
                          type="number"
                          value={autoSaveAmount}
                          onValueChange={setAutoSaveAmount}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl",
                            label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                          }}
                        />

                        <div className="space-y-2">
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Frequency</span>
                          <div className="grid grid-cols-3 gap-2">
                            {(['daily', 'weekly', 'monthly'] as const).map((freq) => {
                              const active = autoSaveFreq === freq;
                              return (
                                <button
                                  key={freq}
                                  type="button"
                                  onClick={() => setAutoSaveFreq(freq)}
                                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer capitalize text-xs font-bold ${
                                    active
                                      ? 'border-primary bg-primary-light/20 text-primary shadow-sm'
                                      : 'border-border bg-input-bg hover:border-primary/20 text-text-secondary'
                                  }`}
                                >
                                  {freq}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <Button
                            onPress={() => openSheet('details')}
                            variant="bordered"
                            className="flex-1 h-11 rounded-xl font-bold text-text-primary border-border"
                          >
                            Cancel
                          </Button>
                          <Button
                            isLoading={isSubmitting}
                            onPress={() => submitAutoSave(true)}
                            className="flex-1 h-11 rounded-xl font-bold text-white bg-primary shadow-md shadow-primary/20"
                          >
                            Schedule
                          </Button>
                        </div>
                      </Modal.Body>
                    </>
                  )}

                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

    </div>
  );
}
