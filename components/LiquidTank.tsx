'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWall } from '@/lib/store';

export function LiquidTank() {
  const { stats, lastVerifiedEvent } = useWall();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentHeightRef = useRef<number>(stats.percentage);
  const targetHeightRef = useRef<number>(stats.percentage);
  const waveSurgeRef = useRef<number>(1);
  const [displayPercent, setDisplayPercent] = useState<number>(stats.percentage);

  useEffect(() => {
    targetHeightRef.current = stats.percentage;
  }, [stats.percentage]);

  useEffect(() => {
    if (lastVerifiedEvent) {
      waveSurgeRef.current = 3.2;
    }
  }, [lastVerifiedEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase1 = 0;
    let phase2 = Math.PI;

    const bubbles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 14; i++) {
      bubbles.push({
        x: Math.random() * 220,
        y: Math.random() * 380,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.6 + 0.25,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      const diff = targetHeightRef.current - currentHeightRef.current;
      currentHeightRef.current += diff * 0.045;

      if (waveSurgeRef.current > 1) {
        waveSurgeRef.current += (1 - waveSurgeRef.current) * 0.035;
      }

      setDisplayPercent(Math.round(currentHeightRef.current * 10) / 10);

      ctx.clearRect(0, 0, width, height);

      const fillRatio = Math.max(0.04, Math.min(1, currentHeightRef.current / 100));
      const waterLevelY = height - fillRatio * height;

      phase1 += 0.03 * waveSurgeRef.current;
      phase2 += 0.02 * waveSurgeRef.current;

      const baseAmplitude = 6 * waveSurgeRef.current;

      // Back Wave
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, waterLevelY);

      for (let x = 0; x <= width; x += 4) {
        const y = waterLevelY + Math.sin(x * 0.025 + phase2) * (baseAmplitude * 0.8);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      const backGrad = ctx.createLinearGradient(0, waterLevelY, 0, height);
      backGrad.addColorStop(0, 'rgba(180, 83, 9, 0.35)');
      backGrad.addColorStop(1, 'rgba(120, 53, 15, 0.6)');
      ctx.fillStyle = backGrad;
      ctx.fill();
      ctx.restore();

      // Ambient Bubbles
      ctx.save();
      bubbles.forEach((b) => {
        b.y -= b.speed * (0.8 + waveSurgeRef.current * 0.3);
        b.x += Math.sin(b.y * 0.04) * 0.4;

        if (b.y < waterLevelY) {
          b.y = height + 4;
          b.x = Math.random() * width;
        }

        if (b.y >= waterLevelY && b.y <= height) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.7})`;
          ctx.fill();
        }
      });
      ctx.restore();

      // Front Wave
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
      frontGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
      frontGrad.addColorStop(0.4, 'rgba(217, 119, 6, 0.85)');
      frontGrad.addColorStop(1, 'rgba(120, 53, 15, 0.95)');
      ctx.fillStyle = frontGrad;
      ctx.fill();

      // Meniscus Line
      ctx.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const y = waterLevelY + Math.sin(x * 0.03 + phase1) * baseAmplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
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
    <div className="relative flex flex-col p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-black/60 shadow-2xl w-full max-w-[280px] sm:max-w-[290px]">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          RESERVOIR
        </span>
        <span className="text-xs font-mono font-bold text-amber-300">
          {displayPercent.toFixed(1)}%
        </span>
      </div>

      <div className="relative w-full h-[320px] sm:h-[350px] rounded-xl overflow-hidden border border-white/[0.1] bg-[#08090d] shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)]">
        <canvas
          ref={canvasRef}
          width={250}
          height={350}
          className="absolute inset-0 w-full h-full"
        />

        <div className="absolute inset-y-0 right-2.5 flex flex-col justify-between py-6 pointer-events-none text-[9px] font-mono text-white/40 select-none z-10">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-amber-300 font-bold">100</span>
            <div className="w-2 h-[1px] bg-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>75</span>
            <div className="w-1.5 h-[1px] bg-white/30" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>50</span>
            <div className="w-1.5 h-[1px] bg-white/30" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>25</span>
            <div className="w-1.5 h-[1px] bg-white/30" />
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span>0</span>
            <div className="w-2 h-[1px] bg-white/40" />
          </div>
        </div>

        <div className="absolute inset-0 rounded-xl border border-white/[0.04] pointer-events-none" />
      </div>

      <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-center space-y-0.5">
        <div className="text-base font-serif font-bold text-white">
          ₹{stats.totalRaised.toLocaleString('en-IN')}
        </div>
        <div className="text-[10px] font-mono text-neutral-500">
          OF ₹{stats.targetAmount.toLocaleString('en-IN')} GOAL
        </div>
      </div>
    </div>
  );
}
