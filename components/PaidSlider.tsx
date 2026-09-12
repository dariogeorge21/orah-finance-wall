'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/audio';

interface PaidSliderProps {
  onConfirmed: () => void;
  isConfirmed?: boolean;
}

export function PaidSlider({ onConfirmed, isConfirmed = false }: PaidSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(isConfirmed);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSoundPos = useRef<number>(0);
  const hasFiredRef = useRef<boolean>(false);

  useEffect(() => {
    setConfirmed(isConfirmed);
    if (isConfirmed) {
      setSliderPosition(1);
      hasFiredRef.current = true;
    } else {
      hasFiredRef.current = false;
      setSliderPosition(0);
    }
  }, [isConfirmed]);

  const handleStart = (clientX: number) => {
    if (confirmed || hasFiredRef.current) return;
    setIsDragging(true);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || confirmed || hasFiredRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const maxDistance = rect.width - handleWidth;
    if (maxDistance <= 0) return;

    const currentX = clientX - rect.left - handleWidth / 2;
    const progress = Math.max(0, Math.min(1, currentX / maxDistance));
    setSliderPosition(progress);

    // Audio click feedback every 25% step
    if (Math.abs(progress - lastSoundPos.current) > 0.2) {
      sounds.playSlideClick();
      lastSoundPos.current = progress;
    }

    if (progress >= 0.96) {
      if (hasFiredRef.current) return;
      hasFiredRef.current = true;
      setIsDragging(false);
      setConfirmed(true);
      setSliderPosition(1);
      sounds.playSlideClick();
      onConfirmed();
    }
  }, [isDragging, confirmed, onConfirmed]);

  const handleEnd = useCallback(() => {
    if (confirmed || hasFiredRef.current) return;
    setIsDragging(false);
    if (sliderPosition < 0.92) {
      setSliderPosition(0);
    } else {
      hasFiredRef.current = true;
      setConfirmed(true);
      setSliderPosition(1);
      sounds.playSlideClick();
      onConfirmed();
    }
  }, [confirmed, sliderPosition, onConfirmed]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className="w-full select-none py-2">
      <div
        ref={containerRef}
        className={`relative h-14 w-full rounded-2xl p-1 transition-colors duration-300 border ${
          confirmed
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
            : 'bg-neutral-900/80 border-white/10 hover:border-amber-500/30'
        } backdrop-blur-xl overflow-hidden flex items-center`}
      >
        {/* Fill Track */}
        <div
          className={`absolute left-0 top-0 bottom-0 rounded-2xl transition-all ${
            confirmed
              ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/40 w-full'
              : 'bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/30'
          }`}
          style={{ width: confirmed ? '100%' : `${sliderPosition * 100}%` }}
        />

        {/* Prompt Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-14">
          {confirmed ? (
            <span className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Payment Confirmed! Submitting...
            </span>
          ) : (
            <span
              className="text-xs sm:text-sm font-medium tracking-wide text-neutral-300/80 transition-opacity duration-200 flex items-center gap-2"
              style={{ opacity: Math.max(0, 1 - sliderPosition * 1.8) }}
            >
              <span>Slide to confirm you have paid</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </span>
          )}
        </div>

        {/* Sliding Thumb Handle */}
        <div
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => e.touches[0] && handleStart(e.touches[0].clientX)}
          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-xl cursor-grab active:cursor-grabbing transition-transform ${
            isDragging ? 'scale-105' : 'scale-100'
          } ${
            confirmed
              ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
          }`}
          style={{
            transform: `translateX(${
              containerRef.current
                ? sliderPosition * (containerRef.current.getBoundingClientRect().width - 56)
                : 0
            }px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {confirmed ? (
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <ArrowRight className="w-5 h-5 stroke-[2.5] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

