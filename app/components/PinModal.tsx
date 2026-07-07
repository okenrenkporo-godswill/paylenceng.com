"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../services/api';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  description?: string;
}

export default function PinModal({
  visible,
  onClose,
  onSuccess,
  title = "Enter Transaction PIN",
  description = "Confirm this transaction with your 4-digit security PIN"
}: PinModalProps) {
  const { colors } = useTheme();
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setPin('');
      setError('');
      setLoading(false);
    }
  }, [visible]);

  // When PIN reaches 4 digits, trigger verification
  useEffect(() => {
    if (pin.length === 4) {
      handleVerify();
    }
  }, [pin]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.verifyPin(pin);
      onSuccess(pin);
      onClose();
    } catch (err: any) {
      setPin('');
      setError(err.message || 'Incorrect transaction PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (val: string) => {
    if (loading) return;
    setError('');
    
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
        disabled={loading}
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
        <div className="absolute inset-0 cursor-default" onClick={loading ? undefined : onClose} />

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
              disabled={loading}
              className="p-1 rounded-full text-text-muted hover:bg-border/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-text-muted text-center mb-6 px-4">
            {description}
          </p>

          {/* Pin Dots */}
          <div className="flex gap-4 mb-6">
            {[0, 1, 2, 3].map(idx => {
              const filled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                    error 
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
            {error ? (
              <span className="text-xs text-danger font-bold text-center">{error}</span>
            ) : loading ? (
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
              <div className="flex-1 h-14" />
              {renderKey('0')}
              {renderKey('backspace')}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
