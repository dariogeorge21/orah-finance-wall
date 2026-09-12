'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="w-full py-16 sm:py-24 px-6 sm:px-12 border-t border-white/[0.08] relative">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="space-y-5 max-w-2xl">
          <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            The Purpose / ORAH 2026
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
            &ldquo;Arise, shine, for your light has come.&rdquo;
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
            In the ancient tongue, <span className="text-white font-normal font-serif">ORAH</span> (א֤וֹרָה) signifies light, radiant clarity, and spiritual illumination. Organized by Jesus Youth Pala, this meet marks a collective milestone in forming youth missionaries for our Jesus Youth Movement. Through prayer, fellowship, and service, we aim to ignite a transformative spark in the hearts of young delegates, empowering them to become beacons of faith and hope in their communities.
          </p>

          <div className="pt-2">
            <a
              href="https://orah26.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all transform active:scale-95 group"
            >
              <span>Register Now</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

       
        </div>
    </section>
  );
}
