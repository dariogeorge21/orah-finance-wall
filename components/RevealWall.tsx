'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWall } from '@/lib/store';
import { TileAttribution } from '@/lib/types';
import { sounds } from '@/lib/audio';
import { Sparkles, Eye, Trophy, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

interface TooltipData {
  attribution: TileAttribution;
  x: number;
  y: number;
}

export function RevealWall() {
  const { settings, revealedTileSet, tileAttributionMap, stats, lastVerifiedEvent } = useWall();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [isHoveringWall, setIsHoveringWall] = useState<boolean>(false);
  const lastHoveredTile = useRef<number | null>(null);

  const cols = settings.grid_cols || 40;
  const rows = settings.grid_rows || 24;

  // Render the masked canvas
  const drawMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const tileW = width / cols;
    const tileH = height / rows;

    ctx.clearRect(0, 0, width, height);

    // If completed, entire wall is clear!
    if (stats.isCompleted) {
      return;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileId = r * cols + c;
        const isRevealed = revealedTileSet.has(tileId);

        if (!isRevealed) {
          // Draw frosted / opaque dark luxury tile mask
          ctx.fillStyle = 'rgba(8, 10, 16, 0.94)';
          ctx.fillRect(c * tileW, r * tileH, tileW, tileH);

          // Subtle grid line border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 0.75;
          ctx.strokeRect(c * tileW, r * tileH, tileW, tileH);
        } else {
          // Subtle border for revealed tile
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * tileW, r * tileH, tileW, tileH);
        }
      }
    }
  }, [cols, rows, revealedTileSet, stats.isCompleted]);

  // Handle Resize and redraw
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      // Set canvas resolution to match container
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawMask();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [drawMask]);

  // Redraw when tiles change
  useEffect(() => {
    drawMask();
  }, [revealedTileSet, drawMask]);

  // Flash highlight newly unlocked tiles when an approval happens
  useEffect(() => {
    if (lastVerifiedEvent && lastVerifiedEvent.revealed_tile_ids.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const tileW = canvas.width / cols;
      const tileH = canvas.height / rows;

      // Draw a burst of light on newly revealed tiles
      lastVerifiedEvent.revealed_tile_ids.forEach((tileId) => {
        const r = Math.floor(tileId / cols);
        const c = tileId % cols;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.fillRect(c * tileW, r * tileH, tileW, tileH);
      });

      // Fade burst away smoothly
      setTimeout(() => {
        drawMask();
      }, 500);
    }
  }, [lastVerifiedEvent, cols, rows, drawMask]);

  // Mouse Move on Wall (Tile Attribution Tooltip)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tileW = rect.width / cols;
    const tileH = rect.height / rows;

    const c = Math.floor(x / tileW);
    const r = Math.floor(y / tileH);

    if (c >= 0 && c < cols && r >= 0 && r < rows) {
      const tileId = r * cols + c;

      if (revealedTileSet.has(tileId)) {
        if (lastHoveredTile.current !== tileId) {
          sounds.playBubble();
          lastHoveredTile.current = tileId;
        }

        const attribution = tileAttributionMap.get(tileId) || {
          tileId,
          contributorName: 'ORAH Supporter',
          amount: 500,
          timestamp: new Date().toISOString(),
          referenceId: 'ORAH-GEN',
        };

        setTooltip({
          attribution,
          x: e.clientX,
          y: e.clientY,
        });
        return;
      }
    }

    setTooltip(null);
    lastHoveredTile.current = null;
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setIsHoveringWall(false);
    lastHoveredTile.current = null;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl p-2.5 sm:p-4 group">
      {/* Top Wall HUD Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold tracking-wider text-amber-300 uppercase text-[11px]">
            Master Reveal Canvas
          </span>
          <span className="text-neutral-500 hidden sm:inline">•</span>
          <span className="text-neutral-400 hidden sm:inline">
            {cols}×{rows} Grid ({cols * rows} Tiles)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-white">{stats.revealedTilesCount}</span>
            <span className="text-neutral-500">/ {stats.totalTiles} Unlocked</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono">
            {stats.percentage}% Revealed
          </span>
        </div>
      </div>

      {/* Main Banner Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringWall(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden cursor-crosshair bg-neutral-950 border border-white/10 shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)]"
      >
        {/* Underlying Banner Artwork */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={settings.banner_image_url || '/orah-banner.svg'}
          alt="ORAH 2026 Master Banner Artwork"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        {/* Dynamic Masking Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-700"
        />

        {/* 100% Complete Victory Aura */}
        {stats.isCompleted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-none p-6 text-center animate-in fade-in duration-700">
            <div className="p-3 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 mb-3 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-wide drop-shadow-lg">
              ORAH 2026 UNLOCKED!
            </h3>
            <p className="text-sm sm:text-base text-amber-200 mt-2 max-w-md drop-shadow">
              Through the communal generosity of Jesus Youth Pala, the complete sacred vision has been revealed.
            </p>
          </div>
        )}

        {/* Subtle Frosted Vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-10" />
      </div>

      {/* Floating Contributor Attribution Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 12}px` }}
        >
          <div className="p-3 rounded-2xl glass-panel border border-amber-500/40 text-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.3)] min-w-[200px] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Tile #{tooltip.attribution.tileId + 1}</span>
            </div>
            <div className="font-bold text-sm text-white">
              {tooltip.attribution.contributorName}
            </div>
            <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-white/10 text-neutral-300">
              <span>Contributed:</span>
              <span className="font-mono font-bold text-emerald-400">
                ₹{tooltip.attribution.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Hint Strip */}
      <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Hover over clear tiles to see who unlocked them</span>
        <span className="flex items-center gap-1 text-amber-400/90 font-medium">
          <Sparkles className="w-3 h-3" />
          Organic Frost-Melt Algorithm
        </span>
      </div>
    </div>
  );
}

