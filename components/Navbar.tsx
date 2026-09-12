'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, Heart } from 'lucide-react';
import { sounds } from '@/lib/audio';
import { useWall } from '@/lib/store';

interface NavbarProps {
  onOpenContribute: () => void;
}

export function Navbar({ onOpenContribute }: NavbarProps) {
  const { isRealtimeConnected } = useWall();
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted());

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-6 sm:px-12 py-4 backdrop-blur-2xl bg-[#07080b]/90 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand & Official JY Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
            <Image
              src="/jyLogo.png"
              alt="Jesus Youth Logo"
              width={40}
              height={40}
              priority
              className="object-contain w-full h-full drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
                ORAH 2026
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-semibold px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5">
                Jesus Youth Pala
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-normal tracking-wide">
              Payment Reveal Wall
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-lg border border-white/[0.07] bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20 transition-colors"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Primary Contribute CTA */}
          <button
            onClick={onOpenContribute}
            className="px-4 sm:px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Heart className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Contribute</span>
          </button>
        </div>
      </div>
    </header>
  );
}
