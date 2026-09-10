'use client';

import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full bg-[#050608] border-t border-white/[0.08] text-neutral-400 text-xs py-12 px-6 sm:px-12 relative z-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src="/jyLogo.png"
                alt="Jesus Youth Emblem"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-serif">
                ORAH 2026
              </div>
              <div className="text-[11px] text-neutral-500">
                Jesus Youth Pala
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            &ldquo;Let your light shine before others&rdquo; — Matthew 5:16
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Jesus Youth Pala. All contributions are utilized exclusively for youth ministry.
          </div>

          <div className="flex items-center gap-6">
            <span>Pala, Kottayam, Kerala</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
