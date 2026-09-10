'use client';

import React from 'react';
import { useWall } from '@/lib/store';
import { Sparkles, Users, Target, Grid } from 'lucide-react';

export function StatsHUD() {
  const { stats } = useWall();

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* Stat 1: Total Raised */}
      <div className="p-4 rounded-2xl glass-card glass-card-hover border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-amber-400">Total Raised</span>
          <Target className="w-3.5 h-3.5 text-amber-400/80" />
        </div>
        <div className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
          ₹{stats.totalRaised.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          Target: ₹{stats.targetAmount.toLocaleString('en-IN')}
        </div>
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
      </div>

      {/* Stat 2: Reveal Progress */}
      <div className="p-4 rounded-2xl glass-card glass-card-hover border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-emerald-400">Wall Revealed</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400/80" />
        </div>
        <div className="text-2xl sm:text-3xl font-black font-serif text-emerald-300 tracking-tight">
          {stats.percentage}%
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.percentage)}%` }}
          />
        </div>
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
      </div>

      {/* Stat 3: Tiles Unlocked */}
      <div className="p-4 rounded-2xl glass-card glass-card-hover border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-cyan-400">Tiles Unlocked</span>
          <Grid className="w-3.5 h-3.5 text-cyan-400/80" />
        </div>
        <div className="text-2xl sm:text-3xl font-black font-serif text-cyan-300 tracking-tight">
          {stats.revealedTilesCount}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          {stats.totalTiles - stats.revealedTilesCount} tiles remaining
        </div>
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />
      </div>

      {/* Stat 4: Community Supporters */}
      <div className="p-4 rounded-2xl glass-card glass-card-hover border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-purple-400">JY Supporters</span>
          <Users className="w-3.5 h-3.5 text-purple-400/80" />
        </div>
        <div className="text-2xl sm:text-3xl font-black font-serif text-purple-300 tracking-tight">
          {stats.totalContributors}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">
          {stats.pendingCount > 0 ? `${stats.pendingCount} pending verification` : 'All verified live'}
        </div>
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
      </div>
    </div>
  );
}

