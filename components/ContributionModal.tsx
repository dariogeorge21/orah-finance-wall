'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  Share2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useWall } from '@/lib/store';
import { PaidSlider } from './PaidSlider';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export function ContributionModal({ isOpen, onClose, initialAmount = 500 }: ContributionModalProps) {
  const { settings, submitPendingContribution } = useWall();
  const [step, setStep] = useState<'amount' | 'payment' | 'submitted'>('amount');
  
  // Form State
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [contributorName, setContributorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [prayerNote, setPrayerNote] = useState<string>('');

  // Payment State
  const [referenceId, setReferenceId] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [hasSlidPaid, setHasSlidPaid] = useState<boolean>(false);
  const [utr, setUtr] = useState<string>('');
  const [utrError, setUtrError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes

  // Reset or setup when opened
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setAmount(initialAmount);
      setIsCustom(false);
      setCustomAmountInput('');
      setHasSlidPaid(false);
      setUtr('');
      setUtrError('');
      setIsSubmitting(false);
      setTimeLeft(600);
      const randRef = `ORAH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setReferenceId(randRef);
    }
  }, [isOpen, initialAmount]);

  // Countdown timer in payment step
  useEffect(() => {
    if (step !== 'payment' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // Generate UPI URI
  const upiUri = useMemo(() => {
    const vpa = settings.upi_vpa;
    const payeeName = settings.upi_payee_name;
    const note = `ORAH2026_${referenceId}`;
    return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&tr=${encodeURIComponent(referenceId)}&tn=${encodeURIComponent(note)}&cu=INR`;
  }, [settings, amount, referenceId]);

  // Generate QR Code data URL
  useEffect(() => {
    if (step === 'payment' && upiUri) {
      QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0a0c14',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR', err));
    }
  }, [step, upiUri]);

  // Estimate tiles to be revealed
  const estimatedTiles = useMemo(() => {
    const totalTiles = settings.grid_cols * settings.grid_rows;
    return Math.max(1, Math.round((amount / settings.target_amount) * totalTiles));
  }, [amount, settings]);

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setIsCustom(false);
    setCustomAmountInput('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountInput(raw);
    setIsCustom(true);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleProceedToPayment = () => {
    if (amount < 10) {
      alert('Minimum contribution amount is ₹10');
      return;
    }
    setStep('payment');
  };

  const copyToClipboard = (text: string, type: 'vpa' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'vpa') {
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utr.trim();
    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit UPI Reference ID / UTR.');
      return;
    }
    if (cleanUtr.length < 6) {
      setUtrError('UTR must be at least 6 characters (typically 12 digits).');
      return;
    }

    setIsSubmitting(true);
    setUtrError('');

    try {
      const created = await submitPendingContribution({
        contributorName: isAnonymous ? 'Anonymous Supporter' : contributorName,
        amount,
        upiTransactionId: cleanUtr,
        prayerNote,
      });

      setSubmittedRef(created.reference_id);
      setStep('submitted');
    } catch (err) {
      console.error(err);
      setUtrError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl glass-panel text-neutral-100 p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-white/15 my-8">
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Amount Selection */}
        {step === 'amount' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ORAH 2026 Reveal Wall
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
                Make a Contribution
              </h3>
              <p className="text-sm text-neutral-400">
                Every contribution fills the tank and dissolves frosted tiles to reveal the sacred artwork.
              </p>
            </div>

            {/* Amount Presets */}
            <div className="space-y-3">
              <label className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                Select Amount (INR)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountSelect(val)}
                    className={`py-3 px-4 rounded-xl text-base font-bold transition-all ${
                      !isCustom && amount === val
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                        : 'bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">₹</span>
                <input
                  type="text"
                  placeholder="Or enter custom amount"
                  value={customAmountInput}
                  onChange={handleCustomAmountChange}
                  className={`w-full rounded-xl bg-white/5 pl-9 pr-4 py-3 text-base text-white border placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isCustom ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10'
                  }`}
                />
              </div>

              {/* Tile impact preview */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <span>Estimated Impact:</span>
                <span className="font-semibold text-amber-300">
                  Unlocks ~{estimatedTiles} {estimatedTiles === 1 ? 'tile' : 'tiles'} on the wall
                </span>
              </div>
            </div>

            {/* Contributor Information */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                    Your Name
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/40"
                    />
                    <span>Remain Anonymous</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? 'Anonymous Supporter' : 'Enter your name (e.g. Albin Pala)'}
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border border-white/10 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-1.5">
                  Prayer Intention / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. For peace, youth ministry, or in gratitude..."
                  value={prayerNote}
                  onChange={(e) => setPrayerNote(e.target.value)}
                  className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border border-white/10 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Proceed to Pay ₹{amount.toLocaleString('en-IN')}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Payment & QR Code Flow */}
        {step === 'payment' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs text-neutral-400">Total Contribution</span>
                <div className="text-2xl font-black text-amber-300 font-serif">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Dynamic QR Display */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-950/80 border border-white/10 relative overflow-hidden">
              <div className="text-xs font-medium text-neutral-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </div>

              {qrDataUrl ? (
                <div className="p-2.5 bg-white rounded-2xl shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="ORAH 2026 UPI QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl bg-neutral-900 animate-pulse flex items-center justify-center text-neutral-500 text-xs">
                  Generating dynamic QR...
                </div>
              )}

              {/* Payee Info & Copy Button */}
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-300">
                <span className="text-neutral-400">VPA:</span>
                <code className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300">
                  {settings.upi_vpa}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.upi_vpa, 'vpa')}
                  className="p-1 hover:text-amber-300 transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Mobile Deep Link CTA */}
              <a
                href={upiUri}
                className="mt-3 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2 sm:hidden"
              >
                <span>Open in UPI App directly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Tactile Paid Slider */}
            <div className="space-y-1">
              <PaidSlider
                isConfirmed={hasSlidPaid}
                onConfirmed={() => setHasSlidPaid(true)}
              />
            </div>

            {/* 12-Digit UTR Input (Revealed after slider) */}
            {hasSlidPaid && (
              <form onSubmit={handleUtrSubmit} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold tracking-wider uppercase text-neutral-300">
                      Enter UPI Reference ID (12-digit UTR)
                    </label>
                    <span className="text-[11px] text-amber-400/90">Required for verification</span>
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="e.g. 428901239845"
                    value={utr}
                    onChange={(e) => {
                      setUtr(e.target.value);
                      if (utrError) setUtrError('');
                    }}
                    autoFocus
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-base font-mono tracking-widest text-white border border-amber-500/40 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                  {utrError && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{utrError}</span>
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Find this 12-digit number in your payment receipt under &apos;UPI Ref No&apos; or &apos;UTR&apos;.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-neutral-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit for Verification</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="flex justify-between items-center text-xs text-neutral-500 pt-2">
              <button
                type="button"
                onClick={() => setStep('amount')}
                className="hover:text-neutral-300 transition-colors underline underline-offset-4"
              >
                ← Change Amount
              </button>
              <span>Ref: {referenceId}</span>
            </div>
          </div>
        )}

        {/* STEP 3: Submission Acknowledgement (Admin Queue Notice) */}
        {step === 'submitted' && (
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Submitted — Verification in Progress
              </div>
              <h3 className="text-2xl font-bold text-white font-serif">
                Thank You for Supporting ORAH 2026!
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto">
                Your contribution of <strong className="text-amber-300 font-semibold">₹{amount.toLocaleString('en-IN')}</strong> has been safely recorded.
              </p>
            </div>

            {/* Notification explanation banner */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/25 text-left text-xs space-y-2 text-neutral-300">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>When will it reflect on the live wall?</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                To maintain complete transparency and integrity, our Jesus Youth Pala finance team verifies each transaction with bank records.
              </p>
              <p className="text-neutral-300">
                🚀 <strong className="text-white">Your tiles will unlock and the liquid tank will splash live</strong> as soon as the admin verifies your payment!
              </p>
              <div className="pt-1 flex items-center justify-between border-t border-white/10 text-[11px] text-neutral-400 font-mono">
                <span>Reference ID: {submittedRef}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedRef, 'ref')}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  {copiedRef ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Social Share & Close */}
            <div className="space-y-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `I just contributed to ORAH 2026! Join Jesus Youth Pala in unlocking the sacred reveal wall: ${typeof window !== 'undefined' ? window.location.href : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/30 flex items-center justify-center gap-2 text-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
              >
                Return to Live Wall
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

