'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Clock, 
  HeartHandshake, 
  Share2, 
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
  const [timeLeft, setTimeLeft] = useState<number>(600);

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

  useEffect(() => {
    if (step !== 'payment' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const upiUri = useMemo(() => {
    const vpa = settings.upi_vpa;
    const payeeName = settings.upi_payee_name;
    const note = `ORAH2026_${referenceId}`;
    return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&tr=${encodeURIComponent(referenceId)}&tn=${encodeURIComponent(note)}&cu=INR`;
  }, [settings, amount, referenceId]);

  useEffect(() => {
    if (step === 'payment' && upiUri) {
      QRCode.toDataURL(upiUri, {
        width: 300,
        margin: 1,
        color: {
          dark: '#07080b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR', err));
    }
  }, [step, upiUri]);

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
      setUtrError('Please enter the 12-digit UPI Reference Number / UTR.');
      return;
    }
    if (cleanUtr.length < 6) {
      setUtrError('UTR must be at least 6 digits (typically 12 digits).');
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
      setUtrError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" 
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-[#090a0e] border border-white/[0.1] text-neutral-100 p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: Amount & Details */}
        {step === 'amount' && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                Contribution • ORAH 2026
              </div>
              <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
                Support the Mission
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Your contribution directly subsidizes delegate resources and clears tiles on the sacred reveal wall.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">
                Select Amount (INR)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountSelect(val)}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      !isCustom && amount === val
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'bg-white/[0.03] border border-white/[0.08] text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-neutral-400">₹</span>
                <input
                  type="text"
                  placeholder="Or enter custom amount"
                  value={customAmountInput}
                  onChange={handleCustomAmountChange}
                  className={`w-full rounded-xl bg-white/[0.03] pl-8 pr-4 py-2.5 text-sm text-white border placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 ${
                    isCustom ? 'border-amber-500/50 bg-amber-500/[0.03]' : 'border-white/[0.08]'
                  }`}
                />
              </div>

              {/* Impact readout */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.01] text-xs">
                <span className="text-neutral-400">Unlocks:</span>
                <span className="font-mono text-amber-300">
                  ~{estimatedTiles} {estimatedTiles === 1 ? 'tile' : 'tiles'} on the master canvas
                </span>
              </div>
            </div>

            {/* Contributor Fields */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                    Your Name
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-white/20 bg-white/[0.04] text-amber-500 focus:ring-amber-500/40"
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
                  className="w-full rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm text-white border border-white/[0.08] placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1.5">
                  Prayer Intention / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. For youth ministry in Pala..."
                  value={prayerNote}
                  onChange={(e) => setPrayerNote(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm text-white border border-white/[0.08] placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* Proceed */}
            <button
              type="button"
              onClick={() => {
                if (amount < 10) {
                  alert('Minimum contribution is ₹10');
                  return;
                }
                setStep('payment');
              }}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-xs text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all"
            >
              Proceed to UPI Payment (₹{amount.toLocaleString('en-IN')})
            </button>
          </div>
        )}

        {/* STEP 2: Dynamic QR & UTR */}
        {step === 'payment' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Contribution</span>
                <div className="text-2xl font-bold font-serif text-white">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/[0.08] text-[11px] font-mono text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Dynamic QR */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.08] bg-black/40">
              <span className="text-[11px] text-neutral-400 mb-3">
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </span>

              {qrDataUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="ORAH 2026 UPI QR"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-xl bg-neutral-900 animate-pulse flex items-center justify-center text-xs text-neutral-500">
                  Generating dynamic QR...
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-300 font-mono">
                <span className="text-neutral-500 font-sans">UPI ID:</span>
                <span className="text-amber-300">{settings.upi_vpa}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(settings.upi_vpa, 'vpa')}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <a
                href={upiUri}
                className="mt-2 text-xs text-amber-400 hover:underline flex items-center gap-1 sm:hidden"
              >
                <span>Open UPI App directly</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <PaidSlider
              isConfirmed={hasSlidPaid}
              onConfirmed={() => setHasSlidPaid(true)}
            />

            {hasSlidPaid && (
              <form onSubmit={handleUtrSubmit} className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <label className="block text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1.5">
                    12-Digit UPI Transaction ID / UTR
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="e.g. 428901239845"
                    value={utr}
                    onChange={(e) => {
                      setUtr(e.target.value);
                      if (utrError) setUtrError('');
                    }}
                    autoFocus
                    className="w-full rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm font-mono text-white border border-amber-500/40 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {utrError && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{utrError}</span>
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Check your UPI payment receipt under &apos;UPI Ref No&apos; or &apos;UTR&apos;.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-neutral-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-105 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </form>
            )}

            <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('amount')}
                className="hover:text-neutral-300 transition-colors"
              >
                ← Back to amount
              </button>
              <span className="font-mono">Ref: {referenceId}</span>
            </div>
          </div>
        )}

        {/* STEP 3: Submitted Status */}
        {step === 'submitted' && (
          <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                Submitted • Verification in Progress
              </div>
              <h3 className="text-2xl font-bold font-serif text-white">
                Thank You for Supporting ORAH 2026
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light max-w-sm mx-auto">
                Your contribution of <strong className="text-white">₹{amount.toLocaleString('en-IN')}</strong> has been safely queued for verification.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-left text-xs space-y-2 text-neutral-300">
              <div className="font-semibold text-white flex items-center gap-2">
                <span>When will it reflect on the wall?</span>
              </div>
              <p className="text-neutral-400 leading-relaxed font-light">
                To preserve 100% financial integrity, our organizer finance team reviews the bank ledger. Once verified, your tiles will ignite and the fluid reservoir will splash live!
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-[11px] text-neutral-500 font-mono">
                <span>Ref: {submittedRef}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedRef, 'ref')}
                  className="text-amber-400 hover:underline"
                >
                  {copiedRef ? 'Copied' : 'Copy Ref'}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `I just supported ORAH 2026! Join Jesus Youth Pala in unlocking the sacred reveal wall: ${typeof window !== 'undefined' ? window.location.href : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-neutral-400 hover:text-white border border-white/[0.06] text-xs transition-all"
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
