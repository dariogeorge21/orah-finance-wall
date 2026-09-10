'use client';

import React, { useState } from 'react';
import { WallProvider } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { RevealWall } from '@/components/RevealWall';
import { LiquidTank } from '@/components/LiquidTank';
import { StatsHUD } from '@/components/StatsHUD';
import { SupportersTicker } from '@/components/SupportersTicker';
import { AboutSection } from '@/components/AboutSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { ContributionModal } from '@/components/ContributionModal';
import { AdminPanel } from '@/components/AdminPanel';
import { Heart, Sparkles, Shield, ArrowDown } from 'lucide-react';

function WallPageContent() {
  const [isContributeOpen, setIsContributeOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  return (
    <main className="min-h-screen flex flex-col bg-[#07080f] text-neutral-100 relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Ambient Radiant Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-cyan-500/6 blur-[130px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onOpenContribute={() => setIsContributeOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* HERO & REVEAL ARENA SECTION */}
      <section id="wall" className="relative z-10 w-full px-4 sm:px-8 pt-8 sm:pt-12 pb-16 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Hero Title & Spiritual Tagline */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>ORAH 2026 • Communal Giving Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-serif leading-[1.15]">
            Unlock the Vision, <br className="hidden sm:inline" />
            <span className="gold-gradient-text">Tile by Tile</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300/90 max-w-xl mx-auto leading-relaxed">
            Every contribution fills the living liquid reservoir and dissolves frosted tiles across the sacred canvas in real time. Join Jesus Youth Pala in revealing ORAH 2026.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsContributeOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-neutral-950" />
              <span>Contribute & Reveal Tiles</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-5 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Organizer Verification Panel</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE ARENA: Reveal Wall + Liquid Tank */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Reveal Wall (Takes 8-9 cols on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9 w-full">
            <RevealWall />
          </div>

          {/* Liquid Tank Widget (Takes 4-3 cols on desktop) */}
          <div className="lg:col-span-4 xl:col-span-3 flex justify-center w-full">
            <LiquidTank />
          </div>
        </div>

        {/* STATS HUD CARDS */}
        <StatsHUD />

        {/* LIVE ACTIVITY TICKER */}
        <SupportersTicker />
      </section>

      {/* ABOUT ORAH 2026 SECTION */}
      <div id="about">
        <AboutSection />
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div id="faq">
        <FAQSection />
      </div>

      {/* FOOTER */}
      <Footer />

      {/* MODALS */}
      <ContributionModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
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

