"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Wallet, ArrowRightLeft, Key, User, FileText, Camera, Upload, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button, Input } from '../../components/UI';
import apiClient from '../../services/api';

type FlowState = 'dashboard' | 'profile_form' | 'bvn_verify' | 'nin_verify' | 'selfie_upload' | 'id_upload' | 'success' | 'pending' | 'rejected';

export default function KycPage() {
  const { userProfile, syncWithBackend } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [currentFlow, setCurrentFlow] = useState<FlowState>('dashboard');
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<any>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Nigeria');

  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');

  // File Upload states
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState('NIN Slip');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadKycStatus = async () => {
    try {
      setLoading(true);
      const [status, profile] = await Promise.all([
        apiClient.fetchKycStatus(),
        apiClient.fetchKycProfile().catch(() => null)
      ]);
      setKycStatus(status);

      if (profile) {
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setMiddleName(profile.middle_name || '');
        setDob(profile.date_of_birth || '');
        setGender(profile.gender || 'Male');
        setPhone(profile.phone_number || '');
        setAddress(profile.address || '');
        setCity(profile.city || '');
        setState(profile.state || '');
        setCountry(profile.country || 'Nigeria');
      }

      if (status.kyc_level === 'Level 3') {
        setCurrentFlow('dashboard');
      } else if (status.verification_status === 'Pending') {
        setCurrentFlow('pending');
      } else if (status.verification_status === 'Rejected') {
        setCurrentFlow('rejected');
      }
    } catch (e) {
      console.warn('Failed to load KYC details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKycStatus();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !dob || !phone || !address || !city || !state) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || null,
        date_of_birth: dob,
        gender,
        phone_number: phone,
        address,
        city,
        state,
        country
      };
      await apiClient.submitKycProfile(payload);
      setSuccessMsg('Your personal details have been updated! You are now KYC Level 1.');
      setCurrentFlow('success');
      syncWithBackend();
    } catch (err: any) {
      alert(err.message || 'Profile submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      alert('BVN must be exactly 11 digits.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.submitBvn(bvn);
      setSuccessMsg('Your BVN has been verified! You are now KYC Level 2.');
      setCurrentFlow('success');
      syncWithBackend();
    } catch (err: any) {
      alert(err.message || 'BVN verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nin.length !== 11 || !/^\d+$/.test(nin)) {
      alert('NIN must be exactly 11 digits.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.submitNin(nin);
      // Move directly to Selfie upload step
      setCurrentFlow('selfie_upload');
    } catch (err: any) {
      alert(err.message || 'NIN submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
    setDocPreview(URL.createObjectURL(file));
  };

  const submitSelfie = async () => {
    if (!selfieFile) return alert('Please capture or select a selfie photo.');
    setSubmitting(true);
    try {
      await apiClient.uploadSelfie(selfieFile);
      setCurrentFlow('id_upload');
    } catch (err: any) {
      alert(err.message || 'Selfie upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitGovId = async () => {
    if (!docFile) return alert('Please select a government ID document file.');
    setSubmitting(true);
    try {
      await apiClient.uploadGovId(docFile);
      await apiClient.submitKycForReview();
      setSuccessMsg('Your KYC documents have been submitted! Our compliance team will review them within 24 hours.');
      setCurrentFlow('pending');
      syncWithBackend();
    } catch (err: any) {
      alert(err.message || 'Gov ID upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center text-text-muted text-sm font-semibold gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Synchronizing KYC profile status...</span>
      </div>
    );
  }

  const level = kycStatus?.kyc_level || 'Level 1';
  const percent = kycStatus?.progress_percentage || 33.3;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-8 select-none">
      
      {/* ── FLOW: DASHBOARD ── */}
      {currentFlow === 'dashboard' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">KYC Verification</h2>
            <p className="text-xs text-text-muted mt-1">Upgrade your tier levels to lift account limitations</p>
          </div>

          {/* Progress Card */}
          <div className="rounded-[24px] p-6 text-white bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg relative overflow-hidden">
            <span className="text-xs font-semibold text-white/80 block uppercase tracking-wider">Current Verification Tier</span>
            <h3 className="text-2xl font-black mt-1">{level}</h3>

            <div className="flex justify-between items-center text-[10px] font-bold text-white/90 mt-6 mb-2">
              <span>Overall Progress</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {/* Limits list */}
          <div className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <h4 className="text-sm font-extrabold text-text-primary">Current Tier Limits</h4>

            <div className="divide-y divide-border/30">
              <div className="flex items-center py-3 gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Max Balance</span>
                  <span className="text-xs font-black text-text-primary mt-0.5 block">
                    {kycStatus?.wallet_balance_limit === 999999999 ? 'Unlimited' : `₦${kycStatus?.wallet_balance_limit?.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center py-3 gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Daily Transfer Limit</span>
                  <span className="text-xs font-black text-text-primary mt-0.5 block">
                    {kycStatus?.daily_transfer_limit === 999999999 ? 'Unlimited' : `₦${kycStatus?.daily_transfer_limit?.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center py-3 gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Withdrawal Access</span>
                  <span className={`text-xs font-black mt-0.5 block ${kycStatus?.can_withdraw ? 'text-emerald-500' : 'text-danger'}`}>
                    {kycStatus?.can_withdraw ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pathways */}
          <div className="bg-surface border border-border p-5 rounded-3xl space-y-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <h4 className="text-sm font-extrabold text-text-primary">Verification Pathways</h4>

            {/* Level 1 */}
            <div className="flex items-center gap-3.5 p-3.5 border border-border bg-input-bg/10 rounded-2xl opacity-75">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-background flex items-center justify-center shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <h6 className="text-xs font-bold text-text-primary">Personal Details (Level 1)</h6>
                <span className="text-[10px] text-text-muted mt-0.5 block">Completed during signup.</span>
              </div>
            </div>

            {/* Level 2 */}
            <div 
              onClick={level === 'Level 1' ? () => setCurrentFlow('bvn_verify') : undefined}
              className={`flex items-center gap-3.5 p-3.5 border rounded-2xl transition-all ${
                level === 'Level 1' 
                  ? 'border-primary bg-primary-light/5 cursor-pointer hover:bg-primary-light/10' 
                  : 'border-border opacity-75'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                level !== 'Level 1' ? 'bg-emerald-500 text-background' : 'bg-primary text-background'
              }`}>
                {level !== 'Level 1' ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <h6 className="text-xs font-bold text-text-primary">Verify BVN (Level 2)</h6>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  {level !== 'Level 1' ? 'Verified.' : 'Link Bank Verification Number.'}
                </span>
              </div>
              {level === 'Level 1' && <ChevronRight className="w-4 h-4 text-text-muted" />}
            </div>

            {/* Level 3 */}
            <div 
              onClick={level === 'Level 2' ? () => setCurrentFlow('nin_verify') : undefined}
              className={`flex items-center gap-3.5 p-3.5 border rounded-2xl transition-all ${
                level === 'Level 2' 
                  ? 'border-primary bg-primary-light/5 cursor-pointer hover:bg-primary-light/10' 
                  : 'border-border opacity-75'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-border text-text-muted flex items-center justify-center shrink-0 text-xs font-bold">
                3
              </div>
              <div className="flex-1">
                <h6 className="text-xs font-bold text-text-primary">Document upload & Selfie (Level 3)</h6>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Link NIN, snap selfie, and upload government ID slip.
                </span>
              </div>
              {level === 'Level 2' && <ChevronRight className="w-4 h-4 text-text-muted" />}
            </div>

          </div>
        </div>
      )}

      {/* ── FLOW: PROFILE FORM ── */}
      {currentFlow === 'profile_form' && (
        <form onSubmit={handleProfileSubmit} className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h3 className="text-base font-extrabold text-text-primary">Update Profile Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onValueChange={setFirstName} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
            <Input label="Last Name" value={lastName} onValueChange={setLastName} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
          </div>

          <Input label="Middle Name" value={middleName} onValueChange={setMiddleName} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
          <Input label="Date of Birth" type="date" value={dob} onValueChange={setDob} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />

          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <Input label="Phone Number" type="tel" value={phone} onValueChange={setPhone} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
          <Input label="Address" value={address} onValueChange={setAddress} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={city} onValueChange={setCity} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
            <Input label="State" value={state} onValueChange={setState} variant="bordered" classNames={{ inputWrapper: "h-11 rounded-xl" }} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="bordered" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setCurrentFlow('dashboard')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold">
              Submit
            </Button>
          </div>
        </form>
      )}

      {/* ── FLOW: BVN VERIFY ── */}
      {currentFlow === 'bvn_verify' && (
        <form onSubmit={handleBvnSubmit} className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-center">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <h3 className="text-base font-extrabold text-text-primary">Link BVN</h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-[340px] mx-auto">
            Your BVN is required to verify your biological birth date and full identity. This step unlocks Level 2 transfers.
          </p>

          <Input
            label="Bank Verification Number"
            placeholder="11-digit BVN number"
            labelPlacement="outside"
            type="number"
            maxLength={11}
            value={bvn}
            onValueChange={setBvn}
            variant="bordered"
            classNames={{
              inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl max-w-[280px] mx-auto",
              label: "text-text-secondary font-bold text-xs uppercase tracking-wider block text-center w-full"
            }}
          />

          <div className="flex gap-3 pt-6 max-w-[280px] mx-auto w-full">
            <Button variant="bordered" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setCurrentFlow('dashboard')}>
              Back
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold">
              Link
            </Button>
          </div>
        </form>
      )}

      {/* ── FLOW: NIN VERIFY ── */}
      {currentFlow === 'nin_verify' && (
        <form onSubmit={handleNinSubmit} className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-center">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <h3 className="text-base font-extrabold text-text-primary">Verify NIN</h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-[340px] mx-auto">
            Please link your 11-digit National Identification Number to continue documents upload.
          </p>

          <Input
            label="National Identification Number"
            placeholder="11-digit NIN number"
            labelPlacement="outside"
            type="number"
            maxLength={11}
            value={nin}
            onValueChange={setNin}
            variant="bordered"
            classNames={{
              inputWrapper: "border-border hover:border-primary focus-within:border-primary bg-input-bg h-11 rounded-xl max-w-[280px] mx-auto",
              label: "text-text-secondary font-bold text-xs uppercase tracking-wider block text-center w-full"
            }}
          />

          <div className="flex gap-3 pt-6 max-w-[280px] mx-auto w-full">
            <Button variant="bordered" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setCurrentFlow('dashboard')}>
              Back
            </Button>
            <Button type="submit" isLoading={submitting} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold">
              Submit
            </Button>
          </div>
        </form>
      )}

      {/* ── FLOW: SELFIE UPLOAD ── */}
      {currentFlow === 'selfie_upload' && (
        <div className="bg-surface border border-border p-5 rounded-3xl space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-center">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>

          <h3 className="text-base font-extrabold text-text-primary">Take a Selfie</h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-[340px] mx-auto">
            We need a clear picture of your face to match against BVN databases. Make sure your room is well lit.
          </p>

          {/* Selfie Preview */}
          <div className="w-36 h-36 rounded-full bg-input-bg border-2 border-border overflow-hidden mx-auto flex items-center justify-center relative">
            {selfiePreview ? (
              <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-text-muted" />
            )}
            
            <label className="absolute bottom-1 right-1 bg-primary text-background p-1.5 rounded-full cursor-pointer shadow-sm hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleSelfieSelect} className="hidden" />
            </label>
          </div>

          <div className="flex gap-3 pt-4 max-w-[280px] mx-auto w-full">
            <Button variant="bordered" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setCurrentFlow('dashboard')}>
              Cancel
            </Button>
            <Button 
              onClick={submitSelfie} 
              isLoading={submitting} 
              disabled={!selfieFile}
              className="flex-1 h-11 bg-primary text-white rounded-xl font-bold cursor-pointer"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ── FLOW: ID UPLOAD ── */}
      {currentFlow === 'id_upload' && (
        <div className="bg-surface border border-border p-5 rounded-3xl space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <h3 className="text-base font-extrabold text-text-primary text-center">Upload Government ID</h3>
          <p className="text-xs text-text-muted leading-relaxed text-center max-w-[340px] mx-auto mb-4">
            Upload a high-quality copy of your select government ID document.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary font-bold text-xs uppercase tracking-wider">ID Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-11 bg-input-bg border border-border rounded-xl px-3 text-text-primary text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="NIN Slip">NIN Slip</option>
              <option value="Passport">International Passport</option>
              <option value="Drivers License">Driver's License</option>
              <option value="National ID">National ID Card</option>
            </select>
          </div>

          {/* Document File Select Drop Zone */}
          <label className="border-2 border-dashed border-border hover:border-primary/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center bg-input-bg/10 hover:bg-input-bg/25 transition-colors">
            {docPreview ? (
              <div className="relative w-full max-h-[160px] overflow-hidden rounded-xl">
                <img src={docPreview} alt="Document upload preview" className="mx-auto max-h-[160px] object-contain rounded-xl" />
              </div>
            ) : (
              <>
                <FileText className="w-10 h-10 text-text-muted" />
                <span className="text-xs font-bold text-text-secondary">Click to upload doc image</span>
                <span className="text-[10px] text-text-muted">Supports PNG, JPG, or PDF</span>
              </>
            )}
            <input type="file" accept="image/*,application/pdf" onChange={handleDocSelect} className="hidden" />
          </label>

          <div className="flex gap-3 pt-4">
            <Button variant="bordered" className="flex-1 h-11 rounded-xl font-bold" onClick={() => setCurrentFlow('dashboard')}>
              Cancel
            </Button>
            <Button 
              onClick={submitGovId} 
              isLoading={submitting} 
              disabled={!docFile}
              className="flex-1 h-11 bg-primary text-white rounded-xl font-bold cursor-pointer"
            >
              Submit KYC
            </Button>
          </div>
        </div>
      )}

      {/* ── FLOW: SUCCESS ── */}
      {currentFlow === 'success' && (
        <div className="bg-surface border border-border p-8 rounded-3xl text-center space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] max-w-md mx-auto">
          <div className="w-14 h-14 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-text-primary">Verification Action Complete</h3>
          <p className="text-xs text-text-muted leading-relaxed px-4">
            {successMsg || 'Action processed successfully! Limits have been refreshed.'}
          </p>

          <Button
            onClick={() => {
              loadKycStatus();
              setCurrentFlow('dashboard');
            }}
            className="w-full h-11 rounded-xl font-bold text-white bg-primary mt-6 cursor-pointer"
          >
            Return to Dashboard
          </Button>
        </div>
      )}

      {/* ── FLOW: PENDING ── */}
      {currentFlow === 'pending' && (
        <div className="bg-surface border border-border p-8 rounded-3xl text-center space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] max-w-md mx-auto">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-text-primary">Review in Progress</h3>
          <p className="text-xs text-text-muted leading-relaxed px-4">
            Your verification documents are being processed by our compliance team. This normally completes within 24 hours.
          </p>

          <Button
            onClick={() => router.push('/dashboard/home')}
            className="w-full h-11 rounded-xl font-bold text-white bg-primary mt-6 cursor-pointer"
          >
            Go Home
          </Button>
        </div>
      )}

      {/* ── FLOW: REJECTED ── */}
      {currentFlow === 'rejected' && (
        <div className="bg-surface border border-border p-8 rounded-3xl text-center space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] max-w-md mx-auto">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldX className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-text-primary">Verification Rejected</h3>
          <p className="text-xs text-text-muted leading-relaxed px-4">
            The submitted files did not pass validation checks. Please capture a clear selfie or upload valid ID slips.
          </p>

          <Button
            onClick={() => setCurrentFlow('nin_verify')}
            className="w-full h-11 rounded-xl font-bold text-white bg-primary mt-6 cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      )}

    </div>
  );
}
