"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/api';
import { Transaction, UserProfile } from '../types/wallet';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextValue {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  login: (payload: Record<string, any>) => Promise<any>;
  signup: (payload: Record<string, any>) => Promise<any>;
  verifyOtp: (email: string, token: string) => Promise<any>;
  logout: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const syncWithBackend = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) return;

      const [realBalance, realTx, profile] = await Promise.all([
        apiClient.fetchBalance(),
        apiClient.fetchTransactions(),
        apiClient.fetchProfile().catch(() => null)
      ]);

      setBalance(realBalance);
      setTransactions(realTx);

      if (profile) {
        setUserProfile({
          id: profile.id || '',
          email: profile.email || '',
          username: profile.username || '',
          full_name: profile.full_name || '',
          kyc_level: profile.kyc_level || 'Level 1',
          created_at: profile.created_at || ''
        });
      }
    } catch (error) {
      console.warn('Failed to sync state with backend:', error);
    }
  };

  // Run on mount to auto-login if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        setIsLoggedIn(true);
        await syncWithBackend();
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  // Sync intervals when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(syncWithBackend, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname.startsWith('/auth');
      if (!isLoggedIn && !isAuthPage) {
        router.push('/auth');
      } else if (isLoggedIn && isAuthPage) {
        router.push('/dashboard/home');
      }
    }
  }, [isLoggedIn, pathname, isLoading]);

  const login = async (payload: Record<string, any>) => {
    const data = await apiClient.login(payload);
    setIsLoggedIn(true);
    await syncWithBackend();
    router.push('/dashboard/home');
    return data;
  };

  const signup = async (payload: Record<string, any>) => {
    return await apiClient.signup(payload);
  };

  const verifyOtp = async (email: string, token: string) => {
    const data = await apiClient.verifyOtp(email, token);
    setIsLoggedIn(true);
    await syncWithBackend();
    router.push('/dashboard/home');
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      setIsLoggedIn(false);
      setUserProfile(null);
      setBalance(0.0);
      setTransactions([]);
      router.push('/auth');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userProfile,
        balance,
        transactions,
        isLoading,
        login,
        signup,
        verifyOtp,
        logout,
        syncWithBackend,
        setBalance,
        setTransactions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthProvider;
