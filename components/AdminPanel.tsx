'use client';

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Settings2, 
  RotateCcw, 
  Zap, 
  DollarSign, 
  Eye, 
  LogOut,
  Sparkles,
  Search
} from 'lucide-react';
import { useWall } from '@/lib/store';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
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
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'settings' | 'testing'>('pending');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Settings form state
  const [targetInput, setTargetInput] = useState<string>(String(settings.target_amount));
  const [vpaInput, setVpaInput] = useState<string>(settings.upi_vpa);
  const [payeeInput, setPayeeInput] = useState<string>(settings.upi_payee_name);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'orah2026admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === envPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password. Please check your credentials.');
    }
  };

  const handleVerify = async (id: string) => {
    setIsProcessing(id);
    try {
      await verifyContribution(id);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this contribution?')) {
      await rejectContribution(id);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200" 
      />

      {/* Admin Window */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass-panel text-neutral-100 p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-white/15 my-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>ORAH 2026 Organizer Control Room</span>
                {isAuthenticated && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified Session
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Verify incoming UPI UTRs to trigger live wall reveal & tank filling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPasswordInput('');
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-xs flex items-center gap-1.5"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION SCREEN */}
        {!isAuthenticated ? (
          <div className="py-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Enter Admin Password</h3>
              <p className="text-xs text-neutral-400">
                Verification access is restricted to authorized Jesus Youth Pala organizers.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter admin password..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  autoFocus
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white border border-white/10 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {authError && (
                <p className="text-xs text-red-400 font-medium">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all text-sm"
              >
                Authenticate Control Room
              </button>
            </form>

            <p className="text-[11px] text-neutral-500">
              Default password configured in <code className="text-neutral-400">.env</code>: <code className="text-amber-400/90 font-mono">orah2026admin</code>
            </p>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col min-h-0 pt-4 space-y-4">
            {/* Quick Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center justify-between">
                  <span>Pending UTRs</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {pendingContributions.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Verified Raised</span>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-emerald-300 mt-1">
                  ₹{stats.totalRaised.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold flex items-center justify-between">
                  <span>Unlocked Tiles</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-cyan-300 mt-1">
                  {stats.revealedTilesCount} / {stats.totalTiles}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold flex items-center justify-between">
                  <span>Target Progress</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold text-purple-300 mt-1">
                  {stats.percentage}%
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 shrink-0 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Queue ({pendingContributions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified History ({verifiedContributions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('testing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === 'testing'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Testing & Sandbox</span>
                </button>
              </div>

              {activeTab === 'pending' || activeTab === 'verified' ? (
                <div className="relative w-44 sm:w-56 hidden sm:block">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search UTR, name..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ) : null}
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[320px]">
              {/* TAB 1: PENDING UTR VERIFICATION QUEUE */}
              {activeTab === 'pending' && (
                <div className="space-y-3">
                  {pendingContributions.length === 0 ? (
                    <div className="text-center py-16 space-y-2 text-neutral-400">
                      <CheckCircle className="w-10 h-10 text-emerald-400/80 mx-auto" />
                      <p className="text-base font-semibold text-white">All Caught Up!</p>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        There are currently no pending payments waiting for verification. When a user submits a contribution modal, it will appear here.
                      </p>
                    </div>
                  ) : (
                    pendingContributions
                      .filter((c) => {
                        if (!searchFilter) return true;
                        const q = searchFilter.toLowerCase();
                        return (
                          c.contributor_name.toLowerCase().includes(q) ||
                          (c.upi_transaction_id && c.upi_transaction_id.toLowerCase().includes(q)) ||
                          c.reference_id.toLowerCase().includes(q)
                        );
                      })
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-white/5 border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-base text-white">
                                {item.contributor_name || 'Anonymous Supporter'}
                              </span>
                              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                Ref: {item.reference_id}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-300 flex-wrap">
                              <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                                <span className="text-neutral-400 font-sans">UTR:</span>
                                <span className="text-emerald-400 font-bold tracking-wider">
                                  {item.upi_transaction_id || 'N/A'}
                                </span>
                              </div>
                              <span className="text-neutral-500 text-[11px]">
                                Submitted {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {item.prayer_note && (
                              <p className="text-xs italic text-neutral-400 bg-black/30 p-2 rounded-lg border border-white/5">
                                &ldquo;{item.prayer_note}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleVerify(item.id)}
                              disabled={isProcessing === item.id}
                              className="px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:opacity-90 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{isProcessing === item.id ? 'Reflecting...' : 'Verify & Reflect Live'}</span>
                            </button>

                            <button
                              onClick={() => handleReject(item.id)}
                              className="p-2.5 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
                              title="Reject / Flag Invalid UTR"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* TAB 2: VERIFIED CONTRIBUTIONS HISTORY */}
              {activeTab === 'verified' && (
                <div className="space-y-2.5">
                  {verifiedContributions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{item.contributor_name}</span>
                          <span className="text-emerald-400 font-bold">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
                          <span>Ref: {item.reference_id}</span>
                          <span>•</span>
                          <span>UTR: {item.upi_transaction_id || 'Direct'}</span>
                          <span>•</span>
                          <span className="text-amber-400">{item.revealed_tile_ids?.length || 0} tiles unlocked</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        {item.verified_at ? new Date(item.verified_at).toLocaleDateString() : 'Verified'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: GLOBAL CONFIGURATION SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Target Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Total fundraising goal. Changing this recalculates tile percentages dynamically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      UPI Payee VPA / ID
                    </label>
                    <input
                      type="text"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Payee Display Name
                    </label>
                    <input
                      type="text"
                      value={payeeInput}
                      onChange={(e) => setPayeeInput(e.target.value)}
                      className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl font-bold text-xs text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                    >
                      Save Configuration
                    </button>
                    {settingsSaved && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Saved!
                      </span>
                    )}
                  </div>
                </form>
              )}

              {/* TAB 4: TESTING & SANDBOX */}
              {activeTab === 'testing' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                      <Zap className="w-4 h-4" />
                      <span>Live Simulation Sandbox</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Instantly test the real-time tank animation, fluid settling, and organic tile melting on the public wall with one click:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => simulateContribution(500, 'Test Contributor (₹500)')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                      >
                        + Simulate ₹500
                      </button>
                      <button
                        onClick={() => simulateContribution(2000, 'Youth Fellowship (₹2,000)')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                      >
                        + Simulate ₹2,000
                      </button>
                      <button
                        onClick={() => simulateContribution(10000, 'Grand Benefactor (₹10,000)')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                      >
                        + Simulate ₹10,000 (Big Splash!)
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Reveal Wall</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Wipe test transactions and restore the wall to the pristine seed state.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Reset wall to initial demo state?')) {
                          resetWall();
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Wall to Demo Seed</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

