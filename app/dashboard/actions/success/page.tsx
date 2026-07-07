"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Share2, Home, Copy, FileText } from 'lucide-react';
import { Button } from '../../../components/UI';

function ReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get('type') || 'transaction';
  const amount = searchParams.get('amount') || '0';
  const recipient = searchParams.get('recipient') || 'N/A';
  const ref = searchParams.get('ref') || 'N/A';
  const remark = searchParams.get('remark') || 'None';
  const date = searchParams.get('date') || 'Today';

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(parseFloat(amount));

  const handleCopyRef = () => {
    try {
      navigator.clipboard.writeText(ref);
      alert('Reference copied to clipboard!');
    } catch {
      alert('Failed to copy reference.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getReceiptTitle = () => {
    switch (type) {
      case 'transfer':
      case 'paylence_transfer':
        return 'Transfer Successful';
      case 'withdraw':
        return 'Withdrawal Initialized';
      case 'topup':
      case 'cable':
      case 'electricity':
      case 'bet':
        return 'Bill Payment Successful';
      case 'giftcard':
        return 'Giftcard Sale Submitted';
      default:
        return 'Transaction Successful';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto pb-8 select-none print:p-0 print:border-none print:shadow-none">
      
      {/* Dynamic Animated Success Stamp */}
      <div className="bg-surface border border-border p-6 rounded-[32px] text-center shadow-xl space-y-4 print:shadow-none">
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <div>
          <h2 className="text-lg font-black text-text-primary">{getReceiptTitle()}</h2>
          <span className="text-[10px] text-text-muted mt-1 block uppercase tracking-widest">Transaction Receipt</span>
        </div>

        <h3 className="text-3xl font-black text-text-primary mt-2">
          {formattedAmount}
        </h3>

        {/* Receipt metadata table */}
        <div className="border border-border/60 bg-input-bg/10 rounded-2xl p-4 text-xs text-left space-y-3 mt-6">
          
          <div className="flex justify-between items-start gap-4">
            <span className="text-text-muted">Recipient / Payee</span>
            <span className="font-bold text-text-primary text-right break-words max-w-[180px]">{recipient}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted">Payment Date</span>
            <span className="font-bold text-text-primary">{date}</span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-text-muted">Reference ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-text-primary truncate max-w-[120px] font-mono">{ref}</span>
              <button onClick={handleCopyRef} className="text-text-muted hover:text-primary transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted">Narration / Remark</span>
            <span className="font-bold text-text-primary">{remark}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted">Status</span>
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Completed</span>
            </span>
          </div>

        </div>

        {/* Action button triggers */}
        <div className="grid grid-cols-2 gap-3 pt-6 print:hidden">
          <Button
            onPress={() => router.push('/dashboard/home')}
            className="h-11 rounded-xl font-bold bg-primary text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Button>
          
          <Button
            onPress={handlePrint}
            variant="outline"
            className="h-11 rounded-xl font-bold text-text-primary border-border flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Print Receipt</span>
          </Button>
        </div>

      </div>

      <div className="text-center print:hidden">
        <span className="text-[10px] text-text-muted font-bold flex items-center justify-center gap-1.5">
          <FileText className="w-4 h-4" />
          <span>Paylence Escrow Verified Payment</span>
        </span>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-text-primary">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReceiptContent />
    </Suspense>
  );
}
