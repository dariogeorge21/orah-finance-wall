'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Lock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Settings2, 
  RotateCcw, 
  RotateCw,
  Zap, 
  LogOut,
  Search,
  ArrowLeft,
  DollarSign,
  Eye,
  Sparkles,
  HeartHandshake,
  MessageSquare,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { WallProvider, useWall } from '@/lib/store';
import { Contribution } from '@/lib/types';

function AdminDashboardContent() {
  const { 
    settings, 
    pendingContributions, 
    verifiedContributions, 
    verifyContribution, 
    rejectContribution, 
    updateSettings, 
    simulateContribution, 
    resetWall,
    stats
  } = useWall();

  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [remainingHours, setRemainingHours] = useState<number>(96);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'prayers' | 'settings' | 'testing'>('pending');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [serverContributions, setServerContributions] = useState<Contribution[]>([]);
  const [hasLoadedServer, setHasLoadedServer] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Settings form state
  const [targetInput, setTargetInput] = useState<string>(String(settings.target_amount));
  const [vpaInput, setVpaInput] = useState<string>(settings.upi_vpa);
  const [payeeInput, setPayeeInput] = useState<string>(settings.upi_payee_name);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Synchronize inputs when settings are loaded or updated from database
  useEffect(() => {
    if (settings) {
      setTargetInput(String(settings.target_amount || '150000'));
      setVpaInput(settings.upi_vpa || '');
      setPayeeInput(settings.upi_payee_name || '');
    }
  }, [settings.target_amount, settings.upi_vpa, settings.upi_payee_name]);

  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dario@jesusyouthpala';

  const refreshPendingQueue = useCallback(async (pwd?: string) => {
    try {
      const res = await fetch('/api/admin/pending', {
        headers: {
          'x-admin-password': pwd || passwordInput.trim() || envPassword,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.contributions)) {
        setServerContributions(data.contributions);
        setHasLoadedServer(true);
      }
    } catch (e) {
      console.warn('Failed to fetch pending queue from server', e);
    }
  }, [passwordInput, envPassword]);

  // Check active 96-hour session cookie on mount
  useEffect(() => {
    fetch('/api/admin/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          if (data.remainingHours) setRemainingHours(data.remainingHours);
          refreshPendingQueue();
        }
      })
      .catch((err) => console.warn('Session check failed', err))
      .finally(() => setIsCheckingSession(false));
  }, [refreshPendingQueue]);

  // Background auto-refresh every 20 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      refreshPendingQueue();
      const now = new Date();
      setLastRefreshedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshPendingQueue]);

  // Manual refresh trigger
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPendingQueue();
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data?.settings) {
        setTargetInput(String(data.settings.target_amount));
        setVpaInput(data.settings.upi_vpa);
        setPayeeInput(data.settings.upi_payee_name);
      }
      const now = new Date();
      setLastRefreshedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('login');
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError('');
        setPasswordInput('');
        setRemainingHours(96);
        await refreshPendingQueue();
      } else {
        setAuthError(data.error || 'Incorrect password. Please verify the admin credentials.');
      }
    } catch {
      setAuthError('Network connection failed while authenticating.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout error', err);
    }
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleVerify = async (id: string) => {
    setIsProcessing(id);
    try {
      await verifyContribution(id);
      await refreshPendingQueue();
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this contribution?')) {
      await rejectContribution(id);
      await refreshPendingQueue();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget = Number(targetInput);
    if (isNaN(newTarget) || newTarget <= 0) {
      alert('Please enter a valid target amount');
      return;
    }
    await updateSettings({
      target_amount: newTarget,
      upi_vpa: vpaInput.trim(),
      upi_payee_name: payeeInput.trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Derive active lists combining server database rows with local store
  const displayContributions = hasLoadedServer 
    ? serverContributions 
    : [...pendingContributions, ...verifiedContributions];

  const handleProductionReset = async () => {
    const confirmation = prompt('WARNING: This will delete ALL contributions from the database, reset the wall to ₹0, and restore full frost over the sacred artwork for production.\n\nType "RESET" to confirm:');
    if (confirmation !== 'RESET') {
      return;
    }

    setIsResetting(true);
    try {
      await resetWall();
      await refreshPendingQueue();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
      alert('Production Reset Complete! All contributions wiped. The wall is starting clean at ₹0.');
    } catch (e) {
      alert('Failed to reset: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setIsResetting(false);
    }
  };

  const pendingList = useMemo(() => {
    return displayContributions.filter((c) => c.status === 'pending');
  }, [displayContributions]);

  const verifiedList = useMemo(() => {
    return displayContributions.filter((c) => c.status === 'verified');
  }, [displayContributions]);

  const prayerList = useMemo(() => {
    return displayContributions.filter((c) => c.prayer_note && c.prayer_note.trim().length > 0);
  }, [displayContributions]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copySinglePrayer = (item: Contribution) => {
    const text = `${item.contributor_name || 'Anonymous'}: "${item.prayer_note}" (₹${Number(item.amount).toLocaleString('en-IN')})`;
    handleCopy(text, item.id);
  };

  const handleCopyAllPrayers = () => {
    if (prayerList.length === 0) return;
    const text = prayerList
      .map((item, idx) => `${idx + 1}. ${item.contributor_name || 'Anonymous'}\n   Prayer Intention: "${item.prayer_note}"\n   Amount: ₹${Number(item.amount).toLocaleString('en-IN')}\n   Date: ${new Date(item.created_at).toLocaleDateString()}`)
      .join('\n\n');
    const fullText = `ORAH 2026 — PRAYER INTENTIONS (${prayerList.length} Requests)\nJesus Youth Pala Missionaries\n=========================================\n\n${text}`;
    handleCopy(fullText, 'all-prayers');
  };

  const handleCopyNamesOnly = () => {
    if (prayerList.length === 0) return;
    const text = prayerList
      .map((item, idx) => `${idx + 1}. ${item.contributor_name || 'Anonymous'}`)
      .join('\n');
    handleCopy(text, 'names-only');
  };

  const handleCopyCompactList = () => {
    if (prayerList.length === 0) return;
    const text = prayerList
      .map((item) => `• ${item.contributor_name || 'Anonymous'}: "${item.prayer_note}"`)
      .join('\n');
    handleCopy(text, 'compact-prayers');
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="w-full px-6 sm:px-12 py-4 border-b border-white/[0.06] bg-[#07080b]/90 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative w-8 h-8 shrink-0">
            <Image
              src="/jyLogo.png"
              alt="Jesus Youth Logo"
              width={32}
              height={32}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-serif">
                ORAH 2026
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5">
                Admin Control Room
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Payment Verification & Confidential Prayer Intentions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Public Wall</span>
          </Link>

          {isAuthenticated && (
            <>
              {/* Refresh Requests Button */}
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="text-xs text-neutral-200 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                title="Refresh requests, verified contributions, and prayer intentions"
              >
                <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Requests'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Session: {remainingHours}h active</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Lock Session / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10">
        {isCheckingSession ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="text-xs text-neutral-400 font-mono">Restoring 96-hour admin session...</p>
          </div>
        ) : !isAuthenticated ? (
          /* LOGIN PROMPT */
          <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl shadow-2xl text-center space-y-6">
            <div className="w-12 h-12 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-white">Organizer Authentication</h2>
              <p className="text-xs text-neutral-400">
                Sign in with the administration key. Your session will stay safely authenticated for up to 96 hours on this browser.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Enter admin password..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                autoFocus
                className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white border border-white/10 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />

              {authError && (
                <p className="text-xs text-red-400 text-left">{authError}</p>
              )}

              <button
                type="submit"
                disabled={isProcessing === 'login'}
                className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing === 'login' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Authorizing (96h Session)...</span>
                  </>
                ) : (
                  <span>Unlock Control Room (96h Session)</span>
                )}
              </button>
            </form>

            <p className="text-[11px] text-neutral-500 font-mono">
              Signed session stays authenticated for 96 hours via secure middleware
            </p>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="space-y-8">
            {/* Metric Overview Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Pending UTRs</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-bold font-serif text-white mt-1">
                  {pendingList.length}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Verified Funds</span>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-bold font-serif text-emerald-300 mt-1">
                  ₹{stats.totalRaised.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Revealed Tiles</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-bold font-serif text-cyan-300 mt-1">
                  {stats.revealedTilesCount} / {stats.totalTiles}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Prayer Intentions</span>
                  <HeartHandshake className="w-3.5 h-3.5" />
                </div>
                <div className="text-2xl font-bold font-serif text-purple-300 mt-1">
                  {prayerList.length}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'pending'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Queue ({pendingList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'verified'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified ({verifiedList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('prayers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'prayers'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Prayer Intentions ({prayerList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('testing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'testing'
                      ? 'bg-neutral-800 text-neutral-300 border border-white/10'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sandbox</span>
                </button>
              </div>

              {(activeTab === 'pending' || activeTab === 'verified' || activeTab === 'prayers') && (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-500">
                    Synced: {lastRefreshedTime}
                  </span>
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search UTR, name, prayer..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TAB 1: PENDING UTR QUEUE */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingList.length === 0 ? (
                  <div className="text-center py-20 border border-white/[0.06] rounded-2xl bg-white/[0.01] space-y-2 text-neutral-400">
                    <CheckCircle className="w-8 h-8 text-emerald-400/80 mx-auto" />
                    <p className="text-sm font-semibold text-white">No Pending Payments</p>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      All submitted payments have been verified. When a user submits their 12-digit UTR on the public wall, it will appear here immediately.
                    </p>
                  </div>
                ) : (
                  pendingList
                    .filter((c) => {
                      if (!searchFilter) return true;
                      const q = searchFilter.toLowerCase();
                      return (
                        c.contributor_name.toLowerCase().includes(q) ||
                        (c.upi_transaction_id && c.upi_transaction_id.toLowerCase().includes(q)) ||
                        c.reference_id.toLowerCase().includes(q) ||
                        (c.prayer_note && c.prayer_note.toLowerCase().includes(q))
                      );
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-xl border border-amber-500/20 bg-white/[0.02] hover:border-amber-500/40 transition-all flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-bold text-base text-white">
                                {item.contributor_name || 'Anonymous Supporter'}
                              </span>
                              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] font-mono text-neutral-500">
                                Ref: {item.reference_id}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-300 flex-wrap">
                              <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded border border-white/10 font-mono">
                                <span className="text-neutral-500 font-sans">Bank UTR:</span>
                                <span className="text-emerald-400 font-bold tracking-wider">
                                  {item.upi_transaction_id || 'N/A'}
                                </span>
                              </div>
                              <span className="text-neutral-500 text-[11px]">
                                Submitted {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Verification Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleVerify(item.id)}
                              disabled={isProcessing === item.id}
                              className="px-4 py-2 rounded-lg font-semibold text-xs text-neutral-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-105 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isProcessing === item.id ? 'Reflecting...' : 'Verify & Reflect Live'}</span>
                            </button>

                            <button
                              onClick={() => handleReject(item.id)}
                              className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Reject UTR"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Confidential Prayer Request Card */}
                        {item.prayer_note ? (
                          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] space-y-1.5 mt-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                                <HeartHandshake className="w-3.5 h-3.5" />
                                <span>Confidential Prayer Request (Visible to Admin Only)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copySinglePrayer(item)}
                                className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-95"
                                title="Copy Name and Prayer Request"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-neutral-200 italic font-serif leading-relaxed">
                              &ldquo;{item.prayer_note}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-500 italic mt-0.5">
                            No prayer note attached with this contribution.
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            )}

            {/* TAB 2: VERIFIED CONTRIBUTIONS */}
            {activeTab === 'verified' && (
              <div className="space-y-3">
                {verifiedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] flex flex-col gap-2.5 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{item.contributor_name}</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Verified Live
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2 font-mono flex-wrap">
                          <span>Ref: {item.reference_id}</span>
                          <span>•</span>
                          <span>UTR: {item.upi_transaction_id || 'Direct'}</span>
                          <span>•</span>
                          <span className="text-amber-400">{item.revealed_tile_ids?.length || 0} tiles unlocked</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {item.verified_at ? new Date(item.verified_at).toLocaleString() : 'Verified'}
                      </span>
                    </div>

                    {/* Show prayer note for verified contributions as well */}
                    {item.prayer_note && (
                      <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/[0.03] text-neutral-300 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-purple-400 font-mono text-[10px] uppercase font-bold not-italic">
                            Prayer Intention:
                          </span>
                          <button
                            type="button"
                            onClick={() => copySinglePrayer(item)}
                            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-95"
                            title="Copy Name and Prayer Request"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="italic text-neutral-200">
                          &ldquo;{item.prayer_note}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: DEDICATED PRAYER INTENTIONS WALL */}
            {activeTab === 'prayers' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-purple-500/20 bg-purple-500/[0.03]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-serif font-bold text-purple-300">
                      <HeartHandshake className="w-4 h-4" />
                      <span>ORAH 2026 Community Prayer Sanctuary</span>
                    </div>
                    <p className="text-xs text-neutral-400 max-w-xl">
                      All prayer intentions submitted by supporters during contributions. These intentions are confidential and only visible in this control room so that intercessory teams can pray for each intention.
                    </p>
                  </div>

                  {prayerList.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyAllPrayers}
                        className="px-3 py-2 rounded-lg font-semibold text-xs text-neutral-950 bg-gradient-to-r from-purple-400 to-pink-400 hover:brightness-105 shadow-[0_0_15px_rgba(192,132,252,0.25)] transition-all flex items-center gap-1.5 active:scale-95"
                        title="Copy all prayer requests with contributor names, amounts, and dates"
                      >
                        {copiedId === 'all-prayers' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-neutral-950" />
                            <span>Copied All ({prayerList.length})!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-neutral-950" />
                            <span>Copy All Prayers ({prayerList.length})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyCompactList}
                        className="px-3 py-2 rounded-lg text-xs font-mono text-neutral-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
                        title="Copy bullet list of Names & Prayer Requests"
                      >
                        {copiedId === 'compact-prayers' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Copy Names & Prayers</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyNamesOnly}
                        className="px-2.5 py-2 rounded-lg text-xs font-mono text-neutral-400 hover:text-white bg-transparent hover:bg-white/[0.05] border border-white/[0.08] transition-all flex items-center gap-1.5 active:scale-95"
                        title="Copy list of contributor names"
                      >
                        {copiedId === 'names-only' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Names Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Names Only</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {prayerList.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 text-xs">
                    No prayer intentions submitted yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prayerList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2 relative group hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white font-serif">{item.contributor_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500 font-mono">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => copySinglePrayer(item)}
                              className="p-1 rounded text-neutral-400 hover:text-purple-300 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 transition-all flex items-center gap-1"
                              title="Copy name and prayer request"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-200 font-serif italic leading-relaxed pt-1 border-t border-white/[0.04]">
                          &ldquo;{item.prayer_note}&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                          <span>Contribution: ₹{item.amount.toLocaleString('en-IN')}</span>
                          <span className={item.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="space-y-5 max-w-lg border border-white/[0.08] p-6 rounded-2xl bg-white/[0.01]">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Target Goal Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Changing this recalculates tile percentages across the reveal wall dynamically.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    UPI Payee VPA / ID
                  </label>
                  <input
                    type="text"
                    value={vpaInput}
                    onChange={(e) => setVpaInput(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    Payee Display Name
                  </label>
                  <input
                    type="text"
                    value={payeeInput}
                    onChange={(e) => setPayeeInput(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl font-semibold text-xs text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all"
                  >
                    Save Changes
                  </button>
                  {settingsSaved && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Configuration Saved
                    </span>
                  )}
                </div>

                {/* Danger Zone: Production Zero Reset */}
                <div className="mt-8 p-5 rounded-xl border border-red-500/20 bg-red-950/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                    <RotateCcw className="w-4 h-4" />
                    <span>Production Reset & Zeroing</span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Wipe all contribution logs and UTR records from the database, zero out the liquid gauge, and restore full frost over the sacred artwork for the live public launch.
                  </p>
                  <button
                    type="button"
                    onClick={handleProductionReset}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>{isResetting ? 'Clearing Database...' : 'Reset to ₹0 (Production Launch)'}</span>
                  </button>
                  {resetSuccess && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Wall successfully reset to clean ₹0 state!
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* TAB 5: SANDBOX & TESTING */}
            {activeTab === 'testing' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                    <Zap className="w-4 h-4" />
                    <span>Instant Live Simulation</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Trigger a verified contribution directly to test the fluid reservoir splash and weighted tile unmasking on the public wall:
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => simulateContribution(500, 'Test Contributor (₹500)')}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      + Simulate ₹500
                    </button>
                    <button
                      onClick={() => simulateContribution(2000, 'Youth Fellowship (₹2,000)')}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      + Simulate ₹2,000
                    </button>
                    <button
                      onClick={() => simulateContribution(10000, 'Grand Benefactor (₹10,000)')}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      + Simulate ₹10,000 (Major Splash)
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                    <RotateCcw className="w-4 h-4" />
                    <span>Production Reset (Start at ₹0)</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Wipes all contributions, pending UTRs, and prayer notes from the Supabase database. Restores the sacred canvas to a completely frosted 0% reveal state with an empty fluid reservoir.
                  </p>
                  <button
                    onClick={handleProductionReset}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>{isResetting ? 'Wiping Database...' : 'Wipe Database & Reset to ₹0'}</span>
                  </button>
                  {resetSuccess && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Production reset complete!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <WallProvider>
      <AdminDashboardContent />
    </WallProvider>
  );
}
