"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Award, Shield, Fingerprint, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Checkbox } from '../components/UI';
import { safeStorage } from '../utils/storage';

type AuthStep = 'splash' | 'login' | 'signup_1' | 'signup_2';

export default function AuthPage() {
  const { login, signup, isLoggedIn } = useAuth();
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<AuthStep>('splash');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toast / alert state
  const [alertMsg, setAlertMsg] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  // Biometrics simulation
  const [showBiometricSim, setShowBiometricSim] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'scan' | 'success' | 'fail'>('scan');

  // Trigger Toast Helper
  const triggerToast = (text: string, type: 'error' | 'success' | 'info' = 'error') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3500);
  };

  // Splash sequence on mount
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Biometrics login logic
  const handleBiometricLogin = async () => {
    try {
      const savedEmail = await safeStorage.getItemAsync('paylence_email');
      const savedPassword = await safeStorage.getItemAsync('paylence_password');
      const biometricEnabled = await safeStorage.getItemAsync('paylence_biometric_enabled');

      if (!savedEmail || !savedPassword || biometricEnabled !== 'true') {
        triggerToast('Biometrics not set up. Please log in with password first.', 'info');
        return;
      }

      setBiometricStatus('scan');
      setShowBiometricSim(true);
      setIsLoading(true);

      // Simulate network wait
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        await login({ email: savedEmail, password: savedPassword });
        setBiometricStatus('success');
        triggerToast('Biometric verified!', 'success');
        setTimeout(() => {
          setShowBiometricSim(false);
          setIsLoading(false);
        }, 800);
      } catch (err: any) {
        setBiometricStatus('fail');
        triggerToast(err.message || 'Biometric login failed.', 'error');
        setTimeout(() => {
          setShowBiometricSim(false);
          setIsLoading(false);
        }, 1200);
      }
    } catch (e: any) {
      setBiometricStatus('fail');
      triggerToast('Biometric check failed.', 'error');
      setShowBiometricSim(false);
      setIsLoading(false);
    }
  };

  // Auto-prompt biometrics if enabled
  useEffect(() => {
    if (step === 'login') {
      const autoPrompt = async () => {
        const enabled = await safeStorage.getItemAsync('paylence_biometric_enabled');
        if (enabled === 'true') {
          setTimeout(() => {
            handleBiometricLogin();
          }, 500);
        }
      };
      autoPrompt();
    }
  }, [step]);

  // Validation checks
  const isEmailValid = (v: string) => v.includes('@') && v.includes('.');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid(email)) {
      triggerToast('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      triggerToast('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      
      // Save credentials for future biometrics check
      await safeStorage.setItemAsync('paylence_email', email);
      await safeStorage.setItemAsync('paylence_password', password);
      
      triggerToast('Welcome back!', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid(email)) {
      triggerToast('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      triggerToast('Password must be at least 6 characters.');
      return;
    }
    if (!agreeToTerms) {
      triggerToast('You must agree to the Terms & Conditions.');
      return;
    }

    try {
      setIsLoading(true);
      triggerToast('Creating account...', 'info');
      await signup({ email, password, firstName, lastName, phone, referralCode });
      
      // Login automatically on signup success
      await login({ email, password });
      await safeStorage.setItemAsync('paylence_email', email);
      await safeStorage.setItemAsync('paylence_password', password);
      
      triggerToast('Account created successfully!', 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      {/* Alert toast message */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`absolute top-6 left-4 right-4 md:left-auto md:right-6 md:w-[350px] z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg border text-white ${
              alertMsg.type === 'success' 
                ? 'bg-success text-white border-success/20' 
                : alertMsg.type === 'info'
                ? 'bg-info text-white border-info/20'
                : 'bg-danger text-white border-danger/20'
            }`}
          >
            {alertMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-semibold">{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth steps */}
      <AnimatePresence mode="wait">
        
        {/* Step: Splash */}
        {step === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center select-none"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-[0_12px_24px_rgba(245,158,11,0.25)] mb-6"
            >
              <Fingerprint className="w-12 h-12 text-[#040712]" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-extrabold tracking-widest text-text-primary"
            >
              PAYLENCE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-text-muted mt-2 font-medium"
            >
              Smart Finance. Zero Limits.
            </motion.p>
          </motion.div>
        )}

        {/* Step: Login */}
        {step === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full max-w-[420px] bg-surface border border-border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-4">
                <Fingerprint className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
              <p className="text-sm text-text-muted mt-1">Sign in to your account with password or biometrics</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                placeholder="email@example.com"
                labelPlacement="outside"
                startContent={<Mail className="w-4 h-4 text-text-muted" />}
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <Input
                label="Password"
                placeholder="••••••"
                labelPlacement="outside"
                startContent={<Lock className="w-4 h-4 text-text-muted" />}
                endContent={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4 text-text-muted" /> : <Eye className="w-4 h-4 text-text-muted" />}
                  </button>
                }
                type={showPassword ? 'text' : 'password'}
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-text-muted">Demo account available</span>
                <button
                  type="button"
                  onClick={() => triggerToast('Demo: joel@paylence.app / password123', 'info')}
                  className="text-primary hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20"
                >
                  Sign In
                </Button>

                <Button
                  type="button"
                  onPress={handleBiometricLogin}
                  variant="bordered"
                  className="w-full h-12 rounded-xl font-bold text-text-primary border-border hover:border-primary flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-5 h-5 text-primary" />
                  Use Biometric Login
                </Button>
              </div>
            </form>

            <div className="text-center mt-6 text-sm">
              <span className="text-text-muted">Don't have an account? </span>
              <button
                onClick={() => setStep('signup_1')}
                className="text-primary font-bold hover:underline"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}

        {/* Step: Signup Step 1 */}
        {step === 'signup_1' && (
          <motion.div
            key="signup_1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full max-w-[420px] bg-surface border border-border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-4">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Create Account</h2>
              <p className="text-sm text-text-muted mt-1">Step 1 of 2: Personal Details</p>
            </div>

            <div className="space-y-4">
              <Input
                label="First Name"
                placeholder="John"
                labelPlacement="outside"
                startContent={<User className="w-4 h-4 text-text-muted" />}
                value={firstName}
                onValueChange={setFirstName}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <Input
                label="Last Name"
                placeholder="Doe"
                labelPlacement="outside"
                startContent={<User className="w-4 h-4 text-text-muted" />}
                value={lastName}
                onValueChange={setLastName}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <Input
                label="Phone Number"
                placeholder="+2348120984408"
                labelPlacement="outside"
                startContent={<Phone className="w-4 h-4 text-text-muted" />}
                value={phone}
                onValueChange={setPhone}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <div className="pt-2 flex gap-3">
                <Button
                  onPress={() => setStep('login')}
                  variant="bordered"
                  className="flex-1 h-12 rounded-xl font-bold text-text-primary border-border hover:border-primary"
                >
                  Back
                </Button>
                <Button
                  onPress={() => {
                    if (!firstName.trim() || !lastName.trim()) {
                      triggerToast('First and Last name are required.');
                      return;
                    }
                    if (!phone.trim()) {
                      triggerToast('Phone number is required.');
                      return;
                    }
                    setStep('signup_2');
                  }}
                  className="flex-1 h-12 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20"
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step: Signup Step 2 */}
        {step === 'signup_2' && (
          <motion.div
            key="signup_2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-[420px] bg-surface border border-border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Secure Account</h2>
              <p className="text-sm text-text-muted mt-1">Step 2 of 2: Login Credentials</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                labelPlacement="outside"
                startContent={<Mail className="w-4 h-4 text-text-muted" />}
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <Input
                label="Password"
                placeholder="Choose password (min 6 chars)"
                labelPlacement="outside"
                startContent={<Lock className="w-4 h-4 text-text-muted" />}
                endContent={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4 text-text-muted" /> : <Eye className="w-4 h-4 text-text-muted" />}
                  </button>
                }
                type={showPassword ? 'text' : 'password'}
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <Input
                label="Referral Code (Optional)"
                placeholder="e.g. JOIN123"
                labelPlacement="outside"
                startContent={<Award className="w-4 h-4 text-text-muted" />}
                value={referralCode}
                onValueChange={setReferralCode}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-12 rounded-xl",
                  label: "text-text-secondary font-bold text-xs uppercase tracking-wider"
                }}
              />

              <div className="pt-2">
                <Checkbox
                  isSelected={agreeToTerms}
                  onValueChange={setAgreeToTerms}
                  classNames={{
                    label: "text-xs text-text-secondary font-medium"
                  }}
                >
                  I agree to the Terms of Service & Privacy Policy
                </Checkbox>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  onPress={() => setStep('signup_1')}
                  variant="bordered"
                  className="flex-1 h-12 rounded-xl font-bold text-text-primary border-border hover:border-primary"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1 h-12 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20"
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Simulated Biometrics Verification Dialog overlay */}
      <AnimatePresence>
        {showBiometricSim && (
          <div className="fixed inset-0 bg-[#040712]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border w-full max-w-[320px] rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${
                biometricStatus === 'scan'
                  ? 'bg-amber-500/10 text-amber-500'
                  : biometricStatus === 'success'
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}>
                {biometricStatus === 'scan' ? (
                  <Fingerprint className="w-10 h-10 animate-pulse" />
                ) : biometricStatus === 'success' ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10" />
                )}
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {biometricStatus === 'scan' ? 'Scanning...' : biometricStatus === 'success' ? 'Authenticated!' : 'Verification Failed'}
              </h3>
              <p className="text-sm text-text-muted mt-2">
                {biometricStatus === 'scan' ? 'Verifying biometric ID credentials' : biometricStatus === 'success' ? 'Welcome back to Paylence' : 'Could not recognize user identity'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
