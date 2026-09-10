'use client';

import React from 'react';
import { useWall } from '@/lib/store';

export function StatsHUD() {
  const { stats } = useWall();

  return (
    <div className="w-full border-y border-white/[0.08] py-5 px-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {/* Metric 1: Total Raised */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            01 / Raised
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            ₹{stats.totalRaised.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            Goal: ₹{stats.targetAmount.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Metric 2: Progress */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            02 / Illumination
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-300 tracking-tight">
            {stats.percentage}%
          </div>
          <div className="w-full bg-white/[0.08] h-1 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, stats.percentage)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Tiles Cleared */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            03 / Canvas Unlocked
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            {stats.revealedTilesCount}
            <span className="text-neutral-500 text-sm font-sans font-normal ml-1.5">
              / {stats.totalTiles}
            </span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            {stats.totalTiles - stats.revealedTilesCount} remaining
          </div>
        </div>

        {/* Metric 4: Supporters */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            04 / Community
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            {stats.totalContributors}
            <span className="text-neutral-500 text-sm font-sans font-normal ml-1.5">
              Gifts
            </span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            {stats.pendingCount > 0 ? `${stats.pendingCount} pending review` : 'All verified'}
          </div>
        </div>
      </div>
    </div>
  );
}
