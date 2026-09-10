'use client';

import React, { useState } from 'react';
import { WallProvider } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { RevealWall } from '@/components/RevealWall';
import { LiquidTank } from '@/components/LiquidTank';
import { StatsHUD } from '@/components/StatsHUD';
// import { SupportersTicker } from '@/components/SupportersTicker';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
import { ContributionModal } from '@/components/ContributionModal';
import { Heart } from 'lucide-react';

function WallPageContent() {
  const [isContributeOpen, setIsContributeOpen] = useState<boolean>(false);

  return (
    <main className="min-h-screen flex flex-col bg-[#07080b] text-neutral-100 relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Minimal Navigation */}
      <Navbar onOpenContribute={() => setIsContributeOpen(true)} />

      {/* HERO & REVEAL CANVAS ARENA */}
      <section id="wall" className="relative z-10 w-full px-6 sm:px-12 pt-8 sm:pt-14 pb-16 max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Editorial Heading */}
        <div className="space-y-3 max-w-3xl">
          <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            ORAH 2026 • Jesus Youth Pala
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.12]">
            Unveiling the Vision, <br />
            <span className="italic font-normal text-amber-300">Tile by Sacred Tile.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed font-light">
            Every contribution fills the living fluid reservoir and dissolves frosted tiles across the sacred canvas in real time. Join Jesus Youth Pala in revealing ORAH 2026.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setIsContributeOpen(true)}
              className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-neutral-950" />
              <span>Make a Contribution</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE ARENA: Canvas & Reservoir Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Master Canvas */}
          <div className="lg:col-span-8 xl:col-span-9 w-full">
            <RevealWall />
          </div>

          {/* Fluid Reservoir Column */}
          <div className="lg:col-span-4 xl:col-span-3 flex justify-center w-full">
            <LiquidTank />
          </div>
        </div>

        {/* METRIC DATUM BAND */}
        <StatsHUD />
      </section>

      {/* ABOUT ORAH 2026 MISSION */}
      <div id="about">
        <AboutSection />
      </div>

      {/* FOOTER */}
      <Footer />

      {/* CONTRIBUTION MODAL */}
      <ContributionModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
      />
    </main>
  );
}

export default function Page() {
  return (
    <WallProvider>
      <WallPageContent />
    </WallProvider>
  );
}
