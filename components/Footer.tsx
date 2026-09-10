'use client';

import React from 'react';
import { Heart, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#05060a] border-t border-white/10 text-neutral-400 text-xs py-12 px-4 sm:px-8 relative z-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About JY Pala */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black font-serif text-base">
                O
              </div>
              <span className="text-base font-bold text-white font-serif tracking-wide">
                ORAH 2026 • Jesus Youth Pala
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              Jesus Youth is an international Catholic movement active across more than 30 nations. ORAH 2026 is organized by the youth ministry of Pala Diocese to foster spiritual renewal and missionary zeal.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Nonprofit Youth Initiative • 100% Transparent Financials</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">ORAH 2026</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#wall" className="hover:text-amber-300 transition-colors">
                  Reveal Wall
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-300 transition-colors">
                  About the Vision
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-300 transition-colors">
                  Donation FAQs
                </a>
              </li>
              <li>
                <span className="text-neutral-500">Official Schedule (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact Organizers</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Pala Diocese, Kerala, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>orah2026@jesusyouth.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+91 94470 00000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Jesus Youth Pala. All rights reserved. Built with love & faith.
          </div>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>&ldquo;Let your light shine before others&rdquo; — Matthew 5:16</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

