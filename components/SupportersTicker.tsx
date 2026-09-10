'use client';

import React, { useState } from 'react';
import { useWall } from '@/lib/store';
import { Sparkles, Trophy, Flame, ChevronRight } from 'lucide-react';

export function SupportersTicker() {
  const { recentVerified, topContributors } = useWall();
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  return (
    <div className="w-full space-y-3">
      {/* Ticker Bar */}
      <div className="w-full rounded-2xl glass-card border border-white/10 px-4 py-2.5 flex items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 whitespace-nowrap">
            Live Stream
          </span>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            {recentVerified.slice(0, 10).map((c, i) => (
              <div key={`${c.id}-${i}`} className="inline-flex items-center gap-2 text-xs text-neutral-300">
                <span className="text-amber-400">✨</span>
                <strong className="text-white font-semibold">{c.contributor_name || 'Supporter'}</strong>
                <span className="text-neutral-400">contributed</span>
                <span className="font-mono font-bold text-emerald-400">₹{c.amount.toLocaleString('en-IN')}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-300/80 text-[11px]">{c.revealed_tile_ids?.length || 0} tiles unlocked</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle Leaderboard */}
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="shrink-0 text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Leaderboard</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showLeaderboard ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Leaderboard Drawer */}
      {showLeaderboard && (
        <div className="p-5 rounded-2xl glass-panel border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">ORAH 2026 Honor Roll</h3>
            </div>
            <span className="text-[11px] text-neutral-400">Top Community Contributions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topContributors.map((supporter, idx) => (
              <div
                key={supporter.name}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-[11px] ${
                      idx === 0
                        ? 'bg-amber-400 text-neutral-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : idx === 1
                        ? 'bg-slate-300 text-neutral-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{supporter.name}</div>
                    <div className="text-[10px] text-neutral-400">{supporter.count} {supporter.count === 1 ? 'gift' : 'gifts'}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{supporter.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

