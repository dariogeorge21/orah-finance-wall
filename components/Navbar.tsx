'use client';

import React, { useState } from 'react';
import { Sparkles, Shield, Volume2, VolumeX, Heart, Radio } from 'lucide-react';
import { sounds } from '@/lib/audio';
import { useWall } from '@/lib/store';

interface NavbarProps {
  onOpenContribute: () => void;
  onOpenAdmin: () => void;
}

export function Navbar({ onOpenContribute, onOpenAdmin }: NavbarProps) {
  const { stats, isRealtimeConnected } = useWall();
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted());

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-[#07080f]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.35)]">
            <span className="font-serif text-lg tracking-tighter">O</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#07080f] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white font-serif">
                ORAH 2026
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                Jesus Youth Pala
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium hidden sm:block">
              Payment Reveal Wall & Communal Giving
            </p>
          </div>
        </div>

        {/* Center Live Sync Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 shadow-inner">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-medium text-[11px] tracking-wide">
            {isRealtimeConnected ? 'LIVE REALTIME SYNC' : 'OFFLINE MODE'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Admin Room Button */}
          <button
            onClick={onOpenAdmin}
            className="relative px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Organizer Admin Panel"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
            {stats.pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] animate-bounce">
                {stats.pendingCount}
              </span>
            )}
          </button>

          {/* Primary Contribute Button */}
          <button
            onClick={onOpenContribute}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Heart className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Contribute</span>
          </button>
        </div>
      </div>
    </header>
  );
}

