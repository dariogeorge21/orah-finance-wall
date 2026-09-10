'use client';

import React from 'react';
import { Sparkles, Calendar, MapPin, Compass, Flame, HeartHandshake } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-8 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            The Vision of ORAH 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-serif">
            Arise, Shine, for Your Light Has Come
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            <strong className="text-amber-300 font-serif italic text-lg">ORAH</strong> (א֤וֹרָה) represents divine illumination, clarity, and renewal. Organized by Jesus Youth Pala, this conference unites thousands of young missionaries, leaders, and families.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl glass-card border border-white/10 relative space-y-3 group hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Missionary Formation</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Equipping hundreds of youth delegates with spiritual leadership, mentorship, and life-changing outreach missions across Kerala and beyond.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 relative space-y-3 group hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Sacred Gathering</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Three transformative days of praise, sacred liturgy, dynamic keynotes, and community fellowship designed to ignite passionate faith in the modern world.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-white/10 relative space-y-3 group hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Communal Giving</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Every tile unlocked directly sponsors a young delegate&apos;s food, accommodation, conference kit, and outreach materials without financial barriers.
            </p>
          </div>
        </div>

        {/* Event Quick Info Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Save the Date</span>
            <h4 className="text-xl sm:text-2xl font-bold text-white font-serif">ORAH 2026 Grand Gathering</h4>
            <p className="text-xs text-neutral-400">Jesus Youth Pala Diocese Missionary Conference</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>December 27 — 30, 2026</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Pala, Kottayam, Kerala</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

