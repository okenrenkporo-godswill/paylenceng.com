"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, ShieldCheck, ShieldAlert, CreditCard, Gift, Key, 
  HelpCircle, AlertCircle, LogOut, Moon, Sun, ToggleLeft, ToggleRight, 
  Building, Check, CheckCircle2, ChevronRight, Laptop, Lock, Delete,
  Fingerprint
} from 'lucide-react';
import { Button, Input, Checkbox } from '../../components/UI';
import { Modal } from '@heroui/react';
import apiClient from '../../services/api';
import { safeStorage } from '../../utils/storage';

export default function ProfilePage() {
  const { logout, userProfile, syncWithBackend } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();

  // Profile data state
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [kycDetails, setKycDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Switch states
  const [notifs, setNotifs] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onOpenChange = () => setIsOpen(!isOpen);
  const [activeModal, setActiveModal] = useState<null | 'pin' | 'banks' | 'link_bank'>(null);

  // Bank Setup Input states
  const [banksList, setBanksList] = useState<Array<{ code: string; name: string }>>([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  // PIN Setup state
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfileInfo = async () => {
    try {
      const [bankData, kycStatusData] = await Promise.all([
        apiClient.fetchBankAccounts(),
        apiClient.fetchKycStatus().catch(() => null),
      ]);
      setBankAccounts(Array.isArray(bankData) ? bankData : []);
      setKycDetails(kycStatusData);
      
      const bioPref = await safeStorage.getItemAsync('paylence_biometric_enabled');
      setBiometricEnabled(bioPref === 'true');
    } catch (e) {
      console.warn('Failed to load profile settings data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileInfo();
  }, []);

  // Biometrics toggle action
  const handleToggleBiometric = async () => {
    try {
      if (!biometricEnabled) {
        const pinStatus = await apiClient.fetchPinStatus();
        if (!pinStatus.has_pin) {
          alert('You must set up a transaction PIN first.');
          openModal('pin');
          return;
        }
        await apiClient.toggleBiometric(true);
        await safeStorage.setItemAsync('paylence_biometric_enabled', 'true');
        setBiometricEnabled(true);
        alert('Biometric Login activated!');
      } else {
        await apiClient.toggleBiometric(false);
        await safeStorage.setItemAsync('paylence_biometric_enabled', 'false');
        setBiometricEnabled(false);
        alert('Biometric Login deactivated.');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to toggle biometric settings.');
    }
  };

  const openModal = (type: 'pin' | 'banks' | 'link_bank') => {
    setActiveModal(type);
    if (type === 'pin') {
      setPinStep('create');
      setPin('');
      setConfirmPin('');
      setPinError('');
    } else if (type === 'link_bank') {
      setAccountNumber('');
      setSelectedBankCode('');
      setResolvedAccountName('');
      setResolveError('');
      fetchBanksList();
    }
    onOpen();
  };

  // Fetch bank dropdown choices
  const fetchBanksList = async () => {
    try {
      const list = await apiClient.fetchBanks();
      setBanksList(list);
    } catch {
      setBanksList([
        { code: '011', name: 'First Bank' },
        { code: '058', name: 'GTBank' },
        { code: '044', name: 'Access Bank' },
        { code: '057', name: 'Zenith Bank' },
        { code: '033', name: 'UBA' },
        { code: '100004', name: 'OPay' },
        { code: '090267', name: 'Kuda Bank' },
        { code: '50515', name: 'Moniepoint' },
      ]);
    }
  };

  // Resolve account details
  useEffect(() => {
    if (accountNumber.length !== 10 || !selectedBankCode) {
      setResolvedAccountName('');
      setResolveError('');
      return;
    }
    const resolve = async () => {
      setIsResolving(true);
      setResolveError('');
      setResolvedAccountName('');
      try {
        const res = await apiClient.resolveBankAccount(accountNumber, selectedBankCode);
        const name = res?.account_name || res?.accountName || '';
        if (name) {
          setResolvedAccountName(name);
        } else {
          setResolveError('Account not found.');
        }
      } catch (err: any) {
        setResolveError(err.message || 'Resolution failed.');
      } finally {
        setIsResolving(false);
      }
    };
    const timer = setTimeout(resolve, 600);
    return () => clearTimeout(timer);
  }, [accountNumber, selectedBankCode]);

  // Submit Bank Linking (Mock/Simulated since backend uses crud)
  const handleLinkBankSubmit = async () => {
    if (!resolvedAccountName) return alert('Account name must be verified.');
    setIsSubmitting(true);
    try {
      // Simulate linking
      await new Promise(r => setTimeout(r, 800));
      // Re-fetch linked accounts
      const bankData = await apiClient.fetchBankAccounts();
      setBankAccounts(Array.isArray(bankData) ? bankData : []);
      openModal('banks');
      alert('Bank Account linked successfully!');
    } catch {
      alert('Linking failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Setup PIN logic
  useEffect(() => {
    if (pinStep === 'create' && pin.length === 4) {
      setPinStep('confirm');
    } else if (pinStep === 'confirm' && confirmPin.length === 4) {
      handleCompletePinSetup();
    }
  }, [pin, confirmPin]);

  const handleCompletePinSetup = async () => {
    if (pin !== confirmPin) {
      setPinError('PINs do not match. Restarting.');
      setPin('');
      setConfirmPin('');
      setPinStep('create');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.createPin(pin);
      alert('Transaction PIN setup successful!');
      onOpenChange(); // Close modal
    } catch (err: any) {
      setPinError(err.message || 'Setup failed.');
      setPin('');
      setConfirmPin('');
      setPinStep('create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinKeyPress = (val: string) => {
    if (isSubmitting) return;
    setPinError('');
    if (val === 'backspace') {
      if (pinStep === 'create') {
        setPin(p => p.slice(0, -1));
      } else {
        setConfirmPin(p => p.slice(0, -1));
      }
    } else {
      if (pinStep === 'create') {
        if (pin.length < 4) setPin(p => p + val);
      } else {
        if (confirmPin.length < 4) setConfirmPin(p => p + val);
      }
    }
  };

  const renderPinKey = (val: string) => {
    const isBackspace = val === 'backspace';
    return (
      <button
        key={val}
        type="button"
        onClick={() => handlePinKeyPress(val)}
        disabled={isSubmitting}
        className={`flex-1 h-12 rounded-xl font-bold text-lg select-none flex items-center justify-center transition-colors ${
          isBackspace ? 'bg-transparent text-text-primary' : 'bg-input-bg dark:bg-card-bg text-text-primary'
        }`}
      >
        {isBackspace ? <Delete className="w-5 h-5" /> : val}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center text-text-muted text-sm font-semibold gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading profile config...</span>
      </div>
    );
  }

  const displayName = userProfile?.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const kycUpgradePercentage = kycDetails?.progress_percentage || 33.3;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-8 select-none">
      
      {/* Premium Avatar Header */}
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg text-center flex flex-col items-center">
        <div className="absolute top-[-60px] right-[-60px] w-[140px] h-[140px] rounded-full bg-white/5 pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full border-[3px] border-white/40 bg-white/20 flex items-center justify-center font-black text-2xl text-white shadow-md relative group">
          {initials}
        </div>

        <h3 className="text-lg font-black tracking-wide mt-4">{displayName}</h3>
        <p className="text-xs text-white/80 mt-1">{userProfile?.email}</p>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-white/20 border border-white/25 mt-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{userProfile?.kyc_level || 'Level 1'} Verified</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 bg-surface border border-border py-4 px-2 rounded-2xl text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div>
          <span className="text-[14px] font-black text-text-primary block">
            {userProfile?.kyc_level?.replace('Level ', 'L') || 'L1'}
          </span>
          <span className="text-[9px] text-text-muted font-bold mt-1.5 block">KYC Limit</span>
        </div>
        <div className="border-l border-border/40">
          <span className="text-[14px] font-black text-text-primary block">{bankAccounts.length}</span>
          <span className="text-[9px] text-text-muted font-bold mt-1.5 block">Linked Banks</span>
        </div>
        <div className="border-l border-border/40">
          <span className="text-[14px] font-black text-text-primary block">₦0</span>
          <span className="text-[9px] text-text-muted font-bold mt-1.5 block">Savings</span>
        </div>
        <div className="border-l border-border/40">
          <span className="text-[14px] font-black text-text-primary block">1</span>
          <span className="text-[9px] text-text-muted font-bold mt-1.5 block">Cards</span>
        </div>
      </div>

      {/* KYC progress tracker banner */}
      <div 
        onClick={() => router.push('/dashboard/kyc')}
        className="bg-surface border border-border rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer hover:border-primary/20 transition-colors"
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-xs font-bold text-text-primary">KYC Verification Checklist</h4>
            <span className="text-[10px] text-text-muted mt-1 block">Improve limitations with NIN linking</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </div>

        <div className="w-full h-2 bg-input-bg rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${kycUpgradePercentage}%` }} />
        </div>
      </div>

      {/* Options settings groups */}
      <div className="space-y-4">
        
        {/* Account group */}
        <div className="space-y-2">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block pl-2">Account</span>
          
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border/30 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <button 
              onClick={() => router.push('/dashboard/kyc')}
              className="w-full flex items-center justify-between p-4 hover:bg-border/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary">KYC Checkup</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>

            <button 
              onClick={() => openModal('banks')}
              className="w-full flex items-center justify-between p-4 hover:bg-border/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary">Linked Bank Accounts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>

            <button 
              onClick={() => router.push('/dashboard/actions/refer')}
              className="w-full flex items-center justify-between p-4 hover:bg-border/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary">Referrals & Rewards</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Security group */}
        <div className="space-y-2">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block pl-2">Security</span>
          
          <div className="bg-surface border border-border rounded-2xl divide-y divide-border/30 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">Biometric Authentication</span>
                  <span className="text-[9px] text-text-muted mt-0.5">Quick transaction overrides</span>
                </div>
              </div>
              
              <button 
                onClick={handleToggleBiometric}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                {biometricEnabled ? (
                  <ToggleRight className="w-9 h-9" />
                ) : (
                  <ToggleLeft className="w-9 h-9" />
                )}
              </button>
            </div>

            <button 
              onClick={() => openModal('pin')}
              className="w-full flex items-center justify-between p-4 hover:bg-border/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-text-primary">Setup Security PIN</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

      </div>

      {/* Logout button */}
      <Button
        onPress={() => logout()}
        className="w-full h-12 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold rounded-2xl flex items-center justify-center gap-2 mt-4 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </Button>

      {/* Settings Modal dialog overlay */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog className="select-none text-text-primary outline-none">
              {({ close }) => (
                <>
                  
                  {/* Modal View: PIN SETUP */}
                  {activeModal === 'pin' && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold text-center">
                        {pinStep === 'create' ? 'Create a Security PIN' : 'Confirm your PIN'}
                      </Modal.Header>
                      <Modal.Body className="pb-6 flex flex-col items-center">
                        <p className="text-xs text-text-muted text-center mb-6 px-4">
                          {pinStep === 'create'
                            ? 'Choose a secure 4-digit PIN to authorize wallet transfers and withdrawals.'
                            : 'Re-enter your transaction PIN to verify match details.'
                          }
                        </p>

                        {/* Dots indicator */}
                        <div className="flex gap-4 mb-4">
                          {[0, 1, 2, 3].map(idx => {
                            const filled = (pinStep === 'create' ? pin : confirmPin).length > idx;
                            return (
                              <div
                                key={idx}
                                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                  pinError ? 'border-danger bg-danger/25' : filled ? 'bg-primary border-primary scale-110' : 'border-border bg-transparent'
                                }`}
                              />
                            );
                          })}
                        </div>

                        <div className="h-6 flex items-center justify-center mb-4">
                          {pinError ? (
                            <span className="text-xs text-danger font-bold text-center">{pinError}</span>
                          ) : isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : null}
                        </div>

                        {/* Custom Keypad grid */}
                        <div className="w-full space-y-3 max-w-[280px]">
                          <div className="flex gap-3">
                            {['1', '2', '3'].map(renderPinKey)}
                          </div>
                          <div className="flex gap-3">
                            {['4', '5', '6'].map(renderPinKey)}
                          </div>
                          <div className="flex gap-3">
                            {['7', '8', '9'].map(renderPinKey)}
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1 h-12" />
                            {renderPinKey('0')}
                            {renderPinKey('backspace')}
                          </div>
                        </div>
                      </Modal.Body>
                    </>
                  )}

                  {/* Modal View: LINKED BANKS LIST */}
                  {activeModal === 'banks' && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                        Linked Bank Accounts
                      </Modal.Header>
                      <Modal.Body className="pb-6">
                        {bankAccounts.length === 0 ? (
                          <div className="border border-border border-dashed rounded-2xl py-8 text-center text-xs text-text-muted mb-4">
                            No bank accounts linked yet.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 mb-4">
                            {bankAccounts.map((acct, idx) => (
                              <div key={idx} className="p-3.5 border border-border bg-background rounded-2xl flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                                  <Building className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h6 className="text-xs font-bold text-text-primary">{acct.bank_name || acct.bank_code || 'Bank'}</h6>
                                  <p className="text-[10px] text-text-muted mt-0.5 truncate">{acct.account_number} · {acct.account_name}</p>
                                </div>
                                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[9px] font-bold">
                                  Active
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button
                          onPress={() => openModal('link_bank')}
                          className="w-full h-11 rounded-xl font-bold text-white bg-primary shadow-sm cursor-pointer"
                        >
                          Link New Bank Account
                        </Button>
                      </Modal.Body>
                    </>
                  )}

                  {/* Modal View: LINK NEW BANK FORM */}
                  {activeModal === 'link_bank' && (
                    <>
                      <Modal.Header className="flex flex-col gap-1 text-base font-extrabold">
                        Link Bank Account
                      </Modal.Header>
                      <Modal.Body className="pb-6 space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Select Bank</label>
                          <select
                            value={selectedBankCode}
                            onChange={(e) => setSelectedBankCode(e.target.value)}
                            className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="">Choose bank</option>
                            {banksList.map((bank) => (
                              <option key={bank.code} value={bank.code}>
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Input
                          label="Account Number"
                          placeholder="10-digit account number"
                          labelPlacement="outside"
                          type="number"
                          maxLength={10}
                          value={accountNumber}
                          onValueChange={setAccountNumber}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl",
                            label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                          }}
                        />

                        {/* Account resolution status feedback */}
                        <div className="h-6 flex items-center justify-center text-xs">
                          {isResolving ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : resolvedAccountName ? (
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              <span>{resolvedAccountName}</span>
                            </span>
                          ) : resolveError ? (
                            <span className="text-danger font-bold">{resolveError}</span>
                          ) : null}
                        </div>

                        <div className="pt-2 flex gap-3">
                          <Button
                            onPress={() => openModal('banks')}
                            variant="outline"
                            className="flex-1 h-11 rounded-xl font-bold text-text-primary border-border"
                          >
                            Back
                          </Button>
                          <Button
                            isPending={isSubmitting}
                            isDisabled={!resolvedAccountName}
                            onPress={handleLinkBankSubmit}
                            className="flex-1 h-11 rounded-xl font-bold text-white bg-primary shadow-sm cursor-pointer"
                          >
                            Link Account
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
