"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Copy, Share2, ArrowRightLeft, ShieldAlert, ArrowUpRight, ArrowDownLeft, Info, HelpCircle } from 'lucide-react';
import { Button, Input } from '../../components/UI';
import { Modal } from '@heroui/react';
import virtualAccountService from '../../services/virtualAccountService';

export default function VirtualAccountsPage() {
  const { syncWithBackend } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Simulation controls
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onOpenChange = () => setIsOpen(!isOpen);
  const [simType, setSimType] = useState<'deposit' | 'withdraw'>('deposit');
  const [simCurrency, setSimCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [simAmount, setSimAmount] = useState('20000');

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const [accts, logs] = await Promise.all([
        virtualAccountService.fetchVirtualAccounts(),
        virtualAccountService.fetchHistory()
      ]);
      setAccounts(accts);
      setTxHistory(logs);
    } catch (e) {
      console.warn('Failed to load virtual accounts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      alert('Account number copied successfully!');
    } catch {
      alert('Failed to copy to clipboard.');
    }
  };

  const handleShare = (acct: any) => {
    const details = `Paylence Virtual Account:\nBank: ${acct.bank_name}\nAccount Number: ${acct.account_number}\nName: ${acct.account_name}\nCurrency: ${acct.currency}`;
    if (navigator.share) {
      navigator.share({
        title: 'Share Payout Account Details',
        text: details
      }).catch(() => {});
    } else {
      handleCopy(details);
    }
  };

  const executeSimulation = async () => {
    const amt = parseFloat(simAmount) || 0;
    if (amt <= 0) return alert('Please enter a valid amount.');

    setSubmitting(true);
    try {
      if (simType === 'deposit') {
        const activeAcct = simCurrency === 'NGN' ? ngnAcct : usdAcct;
        if (!activeAcct) {
          throw new Error(`Please setup your ${simCurrency} account first.`);
        }
        const res = await virtualAccountService.simulateDeposit(
          activeAcct.account_number,
          amt,
          simCurrency
        );
        alert(res.message || 'Deposit simulation successful!');
      } else {
        const res = await virtualAccountService.simulateWithdrawal(amt, simCurrency);
        alert(res.message || 'Withdrawal simulation successful!');
      }
      onOpenChange();
      syncWithBackend();
      loadAccounts();
    } catch (err: any) {
      alert(err.message || 'Simulation execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatAccountNumber = (num: string) => {
    if (!num) return '•••• •••• ••';
    return num.match(/.{1,4}/g)?.join(' ') || num;
  };

  const ngnAcct = accounts.find(a => a.currency === 'NGN');
  const usdAcct = accounts.find(a => a.currency === 'USD');

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-8 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Virtual Funding Accounts</h2>
          <p className="text-xs text-text-muted mt-1">Inward bank transfer details to fund your wallet</p>
        </div>

        <Button
          onPress={() => {
            setSimType('deposit');
            onOpen();
          }}
          className="rounded-xl font-bold text-white bg-primary shadow-sm h-10 cursor-pointer"
        >
          Simulation Engine
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center text-text-muted text-sm font-semibold gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing inward accounts...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* NGN Account Card */}
          {ngnAcct && (
            <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/10">
              <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full bg-white/5 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-base font-black uppercase tracking-wider">{ngnAcct.bank_name}</h4>
                  <span className="text-[10px] text-white/80 block mt-0.5">Local NGN Inward Gateway</span>
                </div>
                <div className="px-2.5 py-1 rounded-md text-[9px] font-black bg-slate-900/40 text-white border border-white/10 uppercase">
                  NGN (₦)
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-widest my-2">
                {formatAccountNumber(ngnAcct.account_number)}
              </h3>

              <div className="h-[1px] bg-white/15 my-4" />

              <div className="flex justify-between items-end">
                <div className="min-w-0 pr-4">
                  <span className="text-[8px] text-white/70 uppercase tracking-wider block">Account Holder Name</span>
                  <span className="text-xs font-black truncate block max-w-[160px] mt-0.5">{ngnAcct.account_name}</span>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleCopy(ngnAcct.account_number)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-amber-600 text-[10px] font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button 
                    onClick={() => handleShare(ngnAcct)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-amber-600 text-[10px] font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USD Account Card */}
          {usdAcct && (
            <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-gradient-to-br from-indigo-900 to-indigo-800 shadow-lg border border-indigo-500/10">
              <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full bg-white/5 pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-base font-black uppercase tracking-wider">{usdAcct.bank_name}</h4>
                  <span className="text-[10px] text-indigo-200/80 block mt-0.5">International USD inward wire</span>
                </div>
                <div className="px-2.5 py-1 rounded-md text-[9px] font-black bg-indigo-600/40 text-white border border-white/10 uppercase">
                  USD ($)
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-widest my-2">
                {formatAccountNumber(usdAcct.account_number)}
              </h3>

              <div className="h-[1px] bg-white/15 my-4" />

              <div className="flex justify-between items-end">
                <div className="min-w-0 pr-4">
                  <span className="text-[8px] text-indigo-200/70 uppercase tracking-wider block">Account Holder Name</span>
                  <span className="text-xs font-black truncate block max-w-[160px] mt-0.5">{usdAcct.account_name}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleCopy(usdAcct.account_number)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-indigo-800 text-[10px] font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button 
                    onClick={() => handleShare(usdAcct)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-indigo-800 text-[10px] font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Deposit Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-surface border border-border rounded-2xl text-xs text-text-secondary leading-relaxed">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p>
              NGN virtual account deposits reflect within 1-3 minutes and credit directly to your main Naira wallet. USD wire transfers may take up to 24 hours to clear compliance verification.
            </p>
          </div>

          {/* Virtual Account logs history */}
          {txHistory.length > 0 && (
            <div className="bg-surface border border-border rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <h4 className="text-sm font-extrabold text-text-primary mb-3">Deposit History Logs</h4>
              
              <div className="divide-y divide-border/40">
                {txHistory.slice(0, 8).map((tx) => {
                  const isDep = tx.type === 'deposit';
                  return (
                    <div key={tx.id} className="flex justify-between items-center py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDep ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {isDep ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-text-primary block capitalize">{tx.type} Funding</span>
                          <span className="text-[9px] text-text-muted block mt-0.5">{tx.date || 'Recent'}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-black ${isDep ? 'text-emerald-500' : 'text-text-primary'}`}>
                        {isDep ? '+' : '-'}{tx.currency === 'USD' ? '$' : '₦'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Simulator Modal overlay */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="md" className="select-none text-text-primary">
            <Modal.Dialog>
              {({ close }: { close: () => void }) => (
                <>
                  <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                    <Modal.Heading>Deposit Simulation Gateway</Modal.Heading>
                  </Modal.Header>
                  
                  <Modal.Body className="pb-6 space-y-4">
                    <div className="flex gap-1.5 p-1 bg-input-bg border border-border rounded-xl">
                      {['deposit', 'withdraw'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setSimType(t as any)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                            simType === t ? 'bg-primary text-background' : 'text-text-muted'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Account Currency</label>
                        <select
                          value={simCurrency}
                          onChange={(e) => setSimCurrency(e.target.value as any)}
                          className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="NGN">Local Naira (₦)</option>
                          <option value="USD">Inward Wire Dollar ($)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Transaction Amount</label>
                        <Input
                          type="number"
                          value={simAmount}
                          onChange={(e) => setSimAmount(e.target.value)}
                          className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" onClick={close}>
                        Cancel
                      </Button>
                      <Button
                        isPending={submitting}
                        onPress={executeSimulation}
                        className="flex-1 h-11 bg-primary text-white font-bold rounded-xl"
                      >
                        Simulate Inward
                      </Button>
                    </div>
                  </Modal.Body>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

    </div>
  );
}
