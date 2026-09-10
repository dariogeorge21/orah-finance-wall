'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWall } from '@/lib/store';
import { Droplet, Sparkles, TrendingUp } from 'lucide-react';

export function LiquidTank() {
  const { stats, lastVerifiedEvent } = useWall();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentHeightRef = useRef<number>(stats.percentage);
  const targetHeightRef = useRef<number>(stats.percentage);
  const waveSurgeRef = useRef<number>(1);
  const [displayPercent, setDisplayPercent] = useState<number>(stats.percentage);

  // Update target when percentage changes
  useEffect(() => {
    targetHeightRef.current = stats.percentage;
  }, [stats.percentage]);

  // Trigger splash surge when new verified payment arrives
  useEffect(() => {
    if (lastVerifiedEvent) {
      waveSurgeRef.current = 3.5; // Trigger splash surge
    }
  }, [lastVerifiedEvent]);

  // Multi-wave canvas liquid physics animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase1 = 0;
    let phase2 = Math.PI;

    // Ambient floating bubbles
    const bubbles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 18; i++) {
      bubbles.push({
        x: Math.random() * 200,
        y: Math.random() * 400,
        size: Math.random() * 3.5 + 1.5,
        speed: Math.random() * 0.7 + 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Spring-settle interpolation towards target height
      const diff = targetHeightRef.current - currentHeightRef.current;
      currentHeightRef.current += diff * 0.05; // Smooth spring tween

      // Dampen wave surge back to normal
      if (waveSurgeRef.current > 1) {
        waveSurgeRef.current += (1 - waveSurgeRef.current) * 0.04;
      }

      setDisplayPercent(Math.round(currentHeightRef.current * 10) / 10);

      ctx.clearRect(0, 0, width, height);

      const fillRatio = Math.max(0.04, Math.min(1, currentHeightRef.current / 100));
      const waterLevelY = height - fillRatio * height;

      // Advance wave phases
      phase1 += 0.035 * waveSurgeRef.current;
      phase2 += 0.025 * waveSurgeRef.current;

      const baseAmplitude = 7 * waveSurgeRef.current;

      // Draw Back Wave (Deeper amber / crimson tone)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, waterLevelY);

      for (let x = 0; x <= width; x += 4) {
        const y = waterLevelY + Math.sin(x * 0.02 + phase2) * (baseAmplitude * 0.85);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const backGrad = ctx.createLinearGradient(0, waterLevelY, 0, height);
      backGrad.addColorStop(0, 'rgba(180, 83, 9, 0.45)');
      backGrad.addColorStop(1, 'rgba(120, 53, 15, 0.7)');
      ctx.fillStyle = backGrad;
      ctx.fill();
      ctx.restore();

      // Draw Rising Bubbles (within liquid zone)
      ctx.save();
      bubbles.forEach((b) => {
        b.y -= b.speed * (0.8 + waveSurgeRef.current * 0.4);
        b.x += Math.sin(b.y * 0.05) * 0.5;

        // Reset bubble when reaching surface or below top
        if (b.y < waterLevelY) {
          b.y = height + 5;
          b.x = Math.random() * width;
        }

        if (b.y >= waterLevelY && b.y <= height) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.8})`;
          ctx.fill();
        }
      });
      ctx.restore();

      // Draw Front Wave (Luminous radiant gold/amber gradient)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, waterLevelY);

      for (let x = 0; x <= width; x += 4) {
        const y = waterLevelY + Math.sin(x * 0.03 + phase1) * baseAmplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const frontGrad = ctx.createLinearGradient(0, waterLevelY, 0, height);
      frontGrad.addColorStop(0, 'rgba(251, 191, 36, 0.85)'); // Radiant Amber Top
      frontGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.8)');
      frontGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.85)');
      frontGrad.addColorStop(1, 'rgba(146, 64, 14, 0.95)');
      ctx.fillStyle = frontGrad;
      ctx.fill();

      // Glowing top crest line
      ctx.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const y = waterLevelY + Math.sin(x * 0.03 + phase1) * baseAmplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 w-full max-w-[280px] sm:max-w-[300px] shadow-2xl">
      {/* Header Label */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Droplet className="w-4 h-4 fill-amber-400/30" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block">
              Fund Reservoir
            </span>
            <span className="text-xs text-neutral-400">ORAH 2026</span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          {displayPercent.toFixed(1)}%
        </span>
      </div>

      {/* Glass Tank Container */}
      <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border-2 border-white/15 bg-neutral-950/70 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {/* Animated Canvas */}
        <canvas
          ref={canvasRef}
          width={260}
          height={360}
          className="absolute inset-0 w-full h-full"
        />

        {/* Tank Measuring Tick Marks */}
        <div className="absolute inset-y-0 right-3 flex flex-col justify-between py-6 pointer-events-none text-[10px] font-mono font-medium text-white/50 select-none z-10">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-amber-300 font-bold">100%</span>
            <div className="w-3 h-0.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>75%</span>
            <div className="w-2 h-0.5 bg-white/40" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>50%</span>
            <div className="w-2.5 h-0.5 bg-white/50" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>25%</span>
            <div className="w-2 h-0.5 bg-white/40" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>0%</span>
            <div className="w-3 h-0.5 bg-white/60" />
          </div>
        </div>

        {/* Glass Glare & Reflections */}
        <div className="absolute inset-y-0 left-2 w-3 bg-gradient-to-r from-white/20 to-transparent rounded-full pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
      </div>

      {/* Tank Footer Stats */}
      <div className="w-full mt-3 pt-3 border-t border-white/10 text-center space-y-1">
        <div className="text-xs text-neutral-400">Current Level</div>
        <div className="text-lg font-bold font-serif text-white flex items-center justify-center gap-1">
          <span className="text-amber-300">₹{stats.totalRaised.toLocaleString('en-IN')}</span>
          <span className="text-neutral-500 font-sans text-xs">/ ₹{stats.targetAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>₹{(stats.targetAmount - stats.totalRaised).toLocaleString('en-IN')} remaining to goal</span>
        </div>
      </div>
    </div>
  );
}

