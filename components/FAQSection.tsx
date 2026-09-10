'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does the Payment Reveal Wall work?',
    answer:
      'Every time a contribution is verified, two live animations occur simultaneously: (1) The liquid reservoir tank rises and splashes with spring fluid physics. (2) A proportional cluster of frosted tiles clears from the master banner using a weighted frost-melting algorithm, revealing the underlying sacred artwork.',
  },
  {
    question: "Why does my contribution say 'Verification in Progress'?",
    answer:
      'To ensure 100% financial integrity, transparency, and prevent automated spam, our organizer finance team verifies the 12-digit UPI UTR against bank records. Once approved in the organizer panel, your tiles instantly ignite and appear on the live wall!',
  },
  {
    question: 'Which UPI apps and methods can I use?',
    answer:
      'You can use any UPI app enabled with QR scanning in India, including Google Pay, PhonePe, Paytm, BHIM, Cred, and mobile banking apps. On mobile devices, clicking "Open in UPI App" directly launches your preferred app.',
  },
  {
    question: 'Can I contribute anonymously or on behalf of a group?',
    answer:
      'Yes! You can check the "Remain Anonymous" box during contribution. You can also name your parish group, prayer cell, family, or youth ministry team (e.g. "St. Thomas JY Pala").',
  },
  {
    question: 'Where will my contribution be utilized?',
    answer:
      '100% of contributions are directed toward ORAH 2026 conference logistics, youth missionary scholarships, accommodation, spiritual resource kits, and mission outreach projects in Pala diocese.',
  },
  {
    question: 'What happens when 100% of the target is reached?',
    answer:
      'When total verified contributions reach the target amount (₹1,50,000), the frosted mask completely dissolves site-wide in a victory celebration sequence with celestial radiance and full-screen confetti!',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-8 border-t border-white/10 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Learn more about the verification process, donation transparency, and the reveal wall.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-card border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-neutral-200 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

