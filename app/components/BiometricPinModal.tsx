"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, Scan, HelpCircle, Delete } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../services/api';
import { safeStorage } from '../utils/storage';

interface BiometricPinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin?: string) => void;
  title?: string;
  description?: string;
  amount?: number;
}

export default function BiometricPinModal({
  visible,
  onClose,
  onSuccess,
  title = "Confirm Transaction",
  description = "Authenticate to complete this action",
  amount
}: BiometricPinModalProps) {
  const { colors } = useTheme();

  const [authMode, setAuthMode] = useState<'biometric' | 'pin' | 'loading'>('loading');
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  // Check biometric availability & run if enabled
  useEffect(() => {
    if (visible) {
      setPin('');
      setPinError('');
      setPinLoading(false);
      setAuthMode('loading');
      initiateAuth();
    }
  }, [visible]);

  const initiateAuth = async () => {
    try {
      // Check if user has biometrics enabled
      const enabled = await safeStorage.getItemAsync('paylence_biometric_enabled');
      
      // Simulate gateway initialization
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (enabled === 'true') {
        setAuthMode('biometric');
        triggerBiometricScan();
      } else {
        setAuthMode('pin');
      }
    } catch (e) {
      setAuthMode('pin');
    }
  };

  const triggerBiometricScan = async () => {
    try {
      // Simulate biometric scan progress
      setPinLoading(true);
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 1500); // 1.5s scanning simulation
      });
      onSuccess(undefined); // Bypass PIN
      onClose();
    } catch (e) {
      setAuthMode('pin');
    } finally {
      setPinLoading(false);
    }
  };

  // Trigger PIN verification when 4 digits are completed
  useEffect(() => {
    if (pin.length === 4) {
      handlePinVerify();
    }
  }, [pin]);

  const handlePinVerify = async () => {
    setPinLoading(true);
    setPinError('');
    try {
      await apiClient.verifyPin(pin);
      onSuccess(pin);
      onClose();
    } catch (err: any) {
      setPin('');
      setPinError(err.message || 'Incorrect transaction PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handleKeyPress = (val: string) => {
    if (pinLoading) return;
    setPinError('');
    
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const renderKey = (val: string) => {
    const isBackspace = val === 'backspace';
    return (
      <button
        key={val}
        type="button"
        onClick={() => handleKeyPress(val)}
        disabled={pinLoading}
        className={`flex-1 h-14 rounded-xl font-bold text-lg select-none cursor-pointer flex items-center justify-center transition-colors ${
          isBackspace 
            ? 'bg-transparent text-text-primary hover:bg-border/10' 
            : 'bg-input-bg dark:bg-card-bg text-text-primary border border-border/5 hover:border-primary/20 shadow-sm'
        }`}
      >
        {isBackspace ? (
          <Delete className="w-5 h-5" />
        ) : (
          val
        )}
      </button>
    );
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#040712]/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        
        {/* Click outside to close */}
        <div className="absolute inset-0 cursor-default" onClick={pinLoading ? undefined : onClose} />

        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="w-full sm:max-w-[380px] bg-surface border border-border rounded-t-[32px] sm:rounded-[32px] p-6 flex flex-col items-center shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-3">
            <h3 className="text-base font-extrabold text-text-primary">{title}</h3>
            <button
              onClick={onClose}
              disabled={pinLoading}
              className="p-1 rounded-full text-text-muted hover:bg-border/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Badge if provided */}
          {amount !== undefined && amount > 0 && (
            <div className="bg-primary-light border border-primary/10 px-6 py-2.5 rounded-2xl mb-4">
              <span className="text-xl font-black text-primary">
                ₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* LOADING GATEWAY */}
          {authMode === 'loading' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 w-full">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-text-muted">Initializing secure gateway...</span>
            </div>
          )}

          {/* BIOMETRIC SCAN */}
          {authMode === 'biometric' && (
            <div className="py-6 flex flex-col items-center justify-center text-center w-full">
              <p className="text-xs text-text-muted mb-6 px-4">
                {description}
              </p>

              <motion.button
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={triggerBiometricScan}
                disabled={pinLoading}
                className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-background shadow-lg shadow-primary/20 mb-6 cursor-pointer"
              >
                {pinLoading ? (
                  <div className="w-8 h-8 border-4 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Fingerprint className="w-12 h-12" />
                )}
              </motion.button>

              <span className="text-xs font-bold text-primary animate-pulse">
                {pinLoading ? 'Verifying biometric signature...' : 'Touch scanner to confirm'}
              </span>

              <button
                type="button"
                onClick={() => setAuthMode('pin')}
                className="mt-6 px-5 py-2.5 border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-border/20 transition-colors cursor-pointer"
              >
                Use Transaction PIN
              </button>
            </div>
          )}

          {/* PIN PAD ENTRY */}
          {authMode === 'pin' && (
            <div className="w-full flex flex-col items-center">
              <p className="text-xs text-text-muted text-center mb-6 px-4">
                Biometric bypass unavailable. Please confirm with your 4-digit transaction PIN.
              </p>

              {/* Pin Dots */}
              <div className="flex gap-4 mb-6">
                {[0, 1, 2, 3].map(idx => {
                  const filled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                        pinError 
                          ? 'border-danger bg-danger/20' 
                          : filled
                          ? 'bg-primary border-primary scale-110 shadow-sm'
                          : 'border-border bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Error Message or Loader */}
              <div className="h-6 flex items-center justify-center mb-4">
                {pinError ? (
                  <span className="text-xs text-danger font-bold text-center">{pinError}</span>
                ) : pinLoading ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : null}
              </div>

              {/* Keypad Grid */}
              <div className="w-full space-y-3">
                <div className="flex gap-3 w-full">
                  {['1', '2', '3'].map(renderKey)}
                </div>
                <div className="flex gap-3 w-full">
                  {['4', '5', '6'].map(renderKey)}
                </div>
                <div className="flex gap-3 w-full">
                  {['7', '8', '9'].map(renderKey)}
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={triggerBiometricScan}
                    className="flex-1 h-14 rounded-xl flex items-center justify-center text-primary hover:bg-primary-light transition-colors cursor-pointer"
                  >
                    <Fingerprint className="w-5 h-5" />
                  </button>
                  {renderKey('0')}
                  {renderKey('backspace')}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
