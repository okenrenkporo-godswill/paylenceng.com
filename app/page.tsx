"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthProvider';

export default function RootPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        router.push('/dashboard/home');
      } else {
        router.push('/auth');
      }
    }
  }, [isLoggedIn, isLoading, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-text-primary">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-text-muted mt-2">Checking session state...</span>
      </div>
    </div>
  );
}
