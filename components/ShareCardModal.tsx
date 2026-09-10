'use client';

import React, { useRef, useEffect } from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributorName: string;
  amount: number;
  tilesCount: number;
  referenceId: string;
}

export function ShareCardModal({
  isOpen,
  onClose,
  contributorName,
  amount,
  tilesCount,
  referenceId,
}: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render 1080x1080 Square Card
    const w = 1080;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    // Background Gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h / 3, 50, w / 2, h / 2, 700);
    bgGrad.addColorStop(0, '#1c1917');
    bgGrad.addColorStop(0.5, '#0c0a09');
    bgGrad.addColorStop(1, '#050505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Gold Border Frame
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 12;
    ctx.strokeRect(36, 36, w - 72, h - 72);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, w - 112, h - 112);

    // Glowing Ambient Aura in Center
    const aura = ctx.createRadialGradient(w / 2, 380, 10, w / 2, 380, 300);
    aura.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
    aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, w, h);

    // Header Badge
    ctx.font = '600 28px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('JESUS YOUTH PALA PRESENTS', w / 2, 180);

    // Event Title
    ctx.font = '900 110px serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '12px';
    ctx.fillText('ORAH 2026', w / 2, 300);

    // Subtitle
    ctx.font = '300 32px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.letterSpacing = '4px';
    ctx.fillText('ARISE, SHINE, FOR YOUR LIGHT HAS COME', w / 2, 370);

    // Decorative Line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 140, 420);
    ctx.lineTo(w / 2 + 140, 420);
    ctx.stroke();

    // Contributor Card Box
    const boxY = 480;
    const boxH = 340;
    const boxW = 860;
    const boxX = (w - boxW) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.roundRect(boxX, boxY, boxW, boxH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.roundRect(boxX, boxY, boxW, boxH, 32);
    ctx.stroke();

    // Contributor Badge
    ctx.font = '700 30px sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('OFFICIAL SUPPORTER', w / 2, boxY + 70);

    // Contributor Name
    ctx.font = 'bold 58px serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(contributorName || 'Anonymous Supporter', w / 2, boxY + 150);

    // Stats Grid inside Box
    ctx.font = '400 30px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Unlocked ~${tilesCount} Sacred Tiles • Contributed ₹${amount.toLocaleString('en-IN')}`, w / 2, boxY + 220);

    ctx.font = '500 24px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`VERIFIED ID: ${referenceId}`, w / 2, boxY + 280);

    // Footer Call to Action
    ctx.font = '500 26px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.letterSpacing = '2px';
    ctx.fillText('Join the communal reveal at orah2026.jy.org', w / 2, 940);
  }, [isOpen, contributorName, amount, tilesCount, referenceId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ORAH-2026-Story-${referenceId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in" />

      <div className="relative w-full max-w-md rounded-3xl glass-panel text-white p-6 shadow-2xl z-10 border border-white/15 my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Story Share Card</span>
          </div>
          <h3 className="text-xl font-bold font-serif">Share Your Generosity</h3>
          <p className="text-xs text-neutral-400">
            Inspire others by posting this card to WhatsApp & Instagram stories!
          </p>
        </div>

        {/* Card Preview */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        {/* Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={handleDownload}
            className="w-full py-3 px-4 rounded-xl font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Story Card</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `I just supported ORAH 2026 and unlocked tiles on the sacred reveal wall! Join Jesus Youth Pala here: ${typeof window !== 'undefined' ? window.location.href : ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/30 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share directly on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

