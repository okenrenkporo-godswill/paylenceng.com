"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthProvider';
import { useTheme } from '../../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Send, Download, Zap, Phone, Tv, Lightbulb, Globe, Users, 
  Gift, ShieldCheck, Building, Check, Copy, Share2, HelpCircle 
} from 'lucide-react';
import { Button, Input } from '../../../components/UI';
import apiClient from '../../../services/api';
import BiometricPinModal from '../../../components/BiometricPinModal';

export default function ActionPage() {
  const { type } = useParams() as { type: string };
  const router = useRouter();
  const { balance, userProfile, syncWithBackend } = useAuth();

  // General States
  const [loading, setLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState('');
  const [resolveError, setResolveError] = useState('');

  // Form Inputs
  const [amount, setAmount] = useState('');
  const [targetAccount, setTargetAccount] = useState(''); // Account number, Phone, Smartcard, Meter, Bet ID
  const [description, setDescription] = useState('');
  
  // Specific drop downs
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [billerCode, setBillerCode] = useState(''); // Network, DSTV package, electricity provider, bookmaker, giftcard type
  const [itemCode, setItemCode] = useState(''); // Package specific info
  const [countryCode, setCountryCode] = useState('US');

  // PIN modal state
  const [pinVisible, setPinVisible] = useState(false);

  // Load Banks on demand
  useEffect(() => {
    if (type === 'transfer' || type === 'withdraw') {
      const getBanksList = async () => {
        try {
          const list = await apiClient.fetchBanks();
          setBanks(list);
        } catch {
          setBanks([
            { code: '058', name: 'GTBank' },
            { code: '011', name: 'First Bank' },
            { code: '044', name: 'Access Bank' },
            { code: '057', name: 'Zenith Bank' },
            { code: '033', name: 'UBA' },
            { code: '100004', name: 'OPay' },
            { code: '090267', name: 'Kuda Bank' },
          ]);
        }
      };
      getBanksList();
    }
  }, [type]);

  // Account name lookup resolver
  useEffect(() => {
    if (targetAccount.length !== 10) {
      setResolvedName('');
      setResolveError('');
      return;
    }

    const resolve = async () => {
      setIsResolving(true);
      setResolveError('');
      setResolvedName('');
      try {
        if (type === 'transfer' || type === 'withdraw') {
          if (!selectedBankCode) return;
          const res = await apiClient.resolveBankAccount(targetAccount, selectedBankCode);
          setResolvedName(res.account_name || 'Account Verified');
        } else if (type === 'paylence_transfer') {
          const res = await apiClient.resolveBankAccount(targetAccount, 'paylence'); // Internal resolve
          setResolvedName(res.account_name || 'Paylence Account Verified');
        }
      } catch (err: any) {
        setResolveError(err.message || 'Lookup failed.');
      } finally {
        setIsResolving(false);
      }
    };

    const timer = setTimeout(resolve, 600);
    return () => clearTimeout(timer);
  }, [targetAccount, selectedBankCode, type]);

  // Submit flow
  const handleValidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amtVal = parseFloat(amount) || 0;
    if (amtVal <= 0) return alert('Please enter a valid amount.');
    if (amtVal > balance && type !== 'refer' && type !== 'giftcard') {
      return alert('Insufficient main wallet balance.');
    }
    if (!targetAccount && type !== 'refer') {
      return alert('Recipient details are required.');
    }

    // Trigger PIN authorization modal
    setPinVisible(true);
  };

  const handleExecuteTransaction = async (pin?: string) => {
    const amtVal = parseFloat(amount) || 0;
    setLoading(true);
    try {
      let response: any = null;
      let targetName = resolvedName || targetAccount;
      let detailSummary = description || 'Processed';

      if (type === 'transfer') {
        const bankName = banks.find(b => b.code === selectedBankCode)?.name || 'Bank';
        response = await apiClient.transferFunds(amtVal, targetAccount, selectedBankCode, bankName, resolvedName, description, pin);
        targetName = `${resolvedName} (${bankName})`;
      } else if (type === 'paylence_transfer') {
        response = await apiClient.transferToPaylence(amtVal, targetAccount, description, pin);
        targetName = `${resolvedName} (Paylence Wallet)`;
      } else if (type === 'withdraw') {
        const bankName = banks.find(b => b.code === selectedBankCode)?.name || 'Bank';
        response = await apiClient.withdrawFunds(amtVal, targetAccount, selectedBankCode, bankName, resolvedName, pin);
        targetName = `${resolvedName} (${bankName})`;
      } else if (type === 'topup') {
        response = await apiClient.buyAirtime(billerCode || 'MTN', targetAccount, amtVal, pin!);
        targetName = `${targetAccount} (${billerCode || 'Airtime'})`;
      } else if (type === 'cable' || type === 'electricity' || type === 'bet') {
        const billType = type === 'bet' ? 'cable' : type;
        response = await apiClient.payBill(billType, amtVal, targetAccount, billerCode, pin);
        targetName = `${targetAccount} (${billerCode || type})`;
      } else if (type === 'giftcard') {
        response = await apiClient.sellGiftcard(billerCode, amtVal, targetAccount, countryCode, pin);
        targetName = `${billerCode} Giftcard`;
        detailSummary = `Code: ${targetAccount}`;
      }

      syncWithBackend();

      // Redirect to TxSuccessScreen with query parameters representing the receipt
      const query = new URLSearchParams({
        type: type,
        amount: String(amtVal),
        recipient: targetName,
        ref: response?.reference || response?.order_id || `TX-${Date.now().toString().slice(-6)}`,
        remark: detailSummary,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      router.push(`/dashboard/actions/success?${query.toString()}`);
    } catch (err: any) {
      alert(err.message || 'Transaction failed. Please check parameters.');
    } finally {
      setLoading(false);
    }
  };

  // Referral desk Copy
  const handleCopyReferral = () => {
    try {
      navigator.clipboard.writeText(userProfile?.referral_code || 'PAYLENCE');
      alert('Referral code copied successfully!');
    } catch {
      alert('Failed to copy.');
    }
  };

  const getFormTitle = () => {
    switch (type) {
      case 'transfer': return 'Transfer to Bank';
      case 'paylence_transfer': return 'Paylence Wallet Transfer';
      case 'withdraw': return 'Withdraw Cashout';
      case 'topup': return 'Buy Airtime';
      case 'cable': return 'Cable TV Bill';
      case 'electricity': return 'Electricity Bill';
      case 'bet': return 'Bet Account Funding';
      case 'giftcard': return 'Sell Giftcard';
      case 'refer': return 'Refer & Earn';
      default: return 'Action Portal';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto pb-8 select-none">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/dashboard/home')}
          className="p-2 rounded-xl bg-surface border border-border hover:border-primary/20 text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text-primary">{getFormTitle()}</h2>
          <span className="text-xs text-text-muted">Fill in form options to proceed securely</span>
        </div>
      </div>

      {/* ── REFERRAL PANEL (NO FORM REQUIRED) ── */}
      {type === 'refer' ? (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-gradient-to-br from-amber-500 to-amber-600 text-center flex flex-col items-center">
            <div className="absolute top-[-50px] right-[-50px] w-[140px] h-[140px] rounded-full bg-white/5 pointer-events-none" />
            <Gift className="w-12 h-12 mb-3 text-white" />
            <h3 className="text-base font-extrabold">Refer & Earn Real Cash</h3>
            <p className="text-xs text-white/80 mt-1 max-w-[280px]">
              Earn ₦500 instantly on every user who signs up with your referral code and funds their wallet.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-3xl p-5 space-y-4 text-center">
            <span className="text-xs font-bold text-text-secondary block">Your Unique Referral Code</span>
            <div className="py-3 px-6 bg-input-bg border border-border/40 rounded-2xl flex justify-between items-center max-w-[280px] mx-auto">
              <span className="font-extrabold text-lg tracking-widest text-primary">{userProfile?.referral_code || 'PAYLENCE'}</span>
              <button onClick={handleCopyReferral} className="text-text-muted hover:text-primary transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button 
                onClick={handleCopyReferral}
                className="px-6 h-11 bg-primary text-white font-bold rounded-xl shadow-sm"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── DYNAMIC ACTION FORM PANEL ── */
        <form onSubmit={handleValidateSubmit} className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          
          {/* Transfer Bank Selection */}
          {(type === 'transfer' || type === 'withdraw') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Select Bank</label>
              <select
                value={selectedBankCode}
                onChange={(e) => setSelectedBankCode(e.target.value)}
                className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Choose bank</option>
                {banks.map(b => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Network Selection (Airtime) */}
          {type === 'topup' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Network Provider</label>
              <select
                value={billerCode}
                onChange={(e) => setBillerCode(e.target.value)}
                className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Select network</option>
                <option value="MTN">MTN Nigeria</option>
                <option value="Airtel">Airtel Nigeria</option>
                <option value="Glo">Globacom</option>
                <option value="9mobile">9mobile</option>
              </select>
            </div>
          )}

          {/* Cable Biller */}
          {type === 'cable' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Cable Provider</label>
              <select
                value={billerCode}
                onChange={(e) => setBillerCode(e.target.value)}
                className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Choose provider</option>
                <option value="DSTV">DSTV Nigeria</option>
                <option value="GOTV">GOtv Nigeria</option>
                <option value="Startimes">StarTimes TV</option>
              </select>
            </div>
          )}

          {/* Electricity Provider */}
          {type === 'electricity' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Electricity Distribution</label>
              <select
                value={billerCode}
                onChange={(e) => setBillerCode(e.target.value)}
                className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Choose distributor</option>
                <option value="EKEDC">Eko Electricity (EKEDC)</option>
                <option value="IKEDC">Ikeja Electricity (IKEDC)</option>
                <option value="AEDC">Abuja Electricity (AEDC)</option>
              </select>
            </div>
          )}

          {/* Bookmakers Bet list */}
          {type === 'bet' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Betting Provider</label>
              <select
                value={billerCode}
                onChange={(e) => setBillerCode(e.target.value)}
                className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Choose bookmaker</option>
                <option value="Bet9ja">Bet9ja</option>
                <option value="SportyBet">SportyBet</option>
                <option value="Betano">Betano</option>
              </select>
            </div>
          )}

          {/* Giftcards */}
          {type === 'giftcard' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Card Type</label>
                <select
                  value={billerCode}
                  onChange={(e) => setBillerCode(e.target.value)}
                  className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Choose type</option>
                  <option value="iTunes">Apple iTunes</option>
                  <option value="Steam">Steam Wallet</option>
                  <option value="Amazon">Amazon Giftcard</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Country</label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="US">United States (USD)</option>
                  <option value="UK">United Kingdom (GBP)</option>
                  <option value="CA">Canada (CAD)</option>
                </select>
              </div>
            </div>
          )}

          {/* Account Target Account Input */}
          <Input
            label={
              type === 'transfer' || type === 'withdraw' || type === 'paylence_transfer' ? 'Recipient Account Number'
              : type === 'topup' ? 'Recipient Phone Number'
              : type === 'cable' ? 'Smartcard Card Number'
              : type === 'electricity' ? 'Prepaid Meter ID'
              : type === 'bet' ? 'Customer Bookmaker ID'
              : 'Giftcard Code / Code Pin'
            }
            placeholder={
              type === 'giftcard' ? 'Enter giftcard serial pin' : '10-digit number details'
            }
            labelPlacement="outside"
            type={type === 'giftcard' ? 'text' : 'number'}
            value={targetAccount}
            onValueChange={setTargetAccount}
            variant="bordered"
            classNames={{ inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl" }}
          />

          {/* Account Lookup Verification status */}
          {(type === 'transfer' || type === 'withdraw' || type === 'paylence_transfer') && (
            <div className="h-6 flex items-center justify-center text-xs">
              {isResolving ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : resolvedName ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>{resolvedName}</span>
                </span>
              ) : resolveError ? (
                <span className="text-danger font-bold">{resolveError}</span>
              ) : null}
            </div>
          )}

          {/* Transaction Amount */}
          <Input
            label="Transaction Amount (₦)"
            placeholder="e.g. 5,000"
            labelPlacement="outside"
            type="number"
            value={amount}
            onValueChange={setAmount}
            variant="bordered"
            classNames={{ inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl" }}
          />

          {/* Narration Description */}
          {type !== 'topup' && type !== 'giftcard' && (
            <Input
              label="Description (Narration)"
              placeholder="e.g. business funding"
              labelPlacement="outside"
              value={description}
              onValueChange={setDescription}
              variant="bordered"
              classNames={{ inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl" }}
            />
          )}

          <span className="text-[10px] text-text-muted font-bold block">
            Wallet Balance Available: ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>

          <Button
            type="submit"
            isLoading={loading}
            disabled={
              (type === 'transfer' || type === 'withdraw' || type === 'paylence_transfer') && !resolvedName
            }
            className="w-full h-12 bg-primary text-white font-bold rounded-2xl shadow-sm mt-4 cursor-pointer"
          >
            Authenticate & Proceed
          </Button>

        </form>
      )}

      {/* PIN Security Modal Overlay */}
      <BiometricPinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSuccess={handleExecuteTransaction}
        amount={parseFloat(amount) || 0}
      />

    </div>
  );
}
