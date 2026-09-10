'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWall } from '@/lib/store';
import { TileAttribution } from '@/lib/types';
import { sounds } from '@/lib/audio';

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

    // If fully completed, dissolve entire mask
    if (stats.isCompleted) {
      return;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileId = r * cols + c;
        const isRevealed = revealedTileSet.has(tileId);

        if (!isRevealed) {
          // Matte deep obsidian mask
          ctx.fillStyle = 'rgba(7, 8, 12, 0.96)';
          ctx.fillRect(c * tileW, r * tileH, tileW, tileH);

          // Subtle hairline grid
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * tileW, r * tileH, tileW, tileH);
        } else {
          // Revealed tile subtle hairline
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * tileW, r * tileH, tileW, tileH);
        }
      }
    }
  }, [cols, rows, revealedTileSet, stats.isCompleted]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawMask();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [drawMask]);

  useEffect(() => {
    drawMask();
  }, [revealedTileSet, drawMask]);

  // Flash highlight on newly revealed tiles
  useEffect(() => {
    if (lastVerifiedEvent && lastVerifiedEvent.revealed_tile_ids.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const tileW = canvas.width / cols;
      const tileH = canvas.height / rows;

      lastVerifiedEvent.revealed_tile_ids.forEach((tileId) => {
        const r = Math.floor(tileId / cols);
        const c = tileId % cols;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.fillRect(c * tileW, r * tileH, tileW, tileH);
      });

      setTimeout(() => {
        drawMask();
      }, 500);
    }
  }, [lastVerifiedEvent, cols, rows, drawMask]);

  // Mouse Move on Wall
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
    lastHoveredTile.current = null;
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl p-2 sm:p-3">
      {/* Wall Header Meta */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] mb-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>MASTER CANVAS</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-500">{cols}×{rows} MATRIX</span>
        </div>

        <div className="font-mono text-[11px] text-amber-300">
          {stats.percentage}% UNVEILED
        </div>
      </div>

      {/* Main Canvas Artwork Arena */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden cursor-crosshair bg-neutral-950 border border-white/[0.04]"
      >
        {/* Underlying Sacred Artwork with Smart Blur until 100% completed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={settings.banner_image_url || '/jesusAndChildren.jpg'}
          alt="ORAH 2026 Master Canvas"
          className="absolute inset-0 w-full h-full object-cover object-center select-none transition-all duration-1000 ease-out"
          style={{
            filter: stats.isCompleted || stats.percentage >= 100 
              ? 'blur(0px)' 
              : 'blur(16px) brightness(0.98)',
            transform: stats.isCompleted || stats.percentage >= 100 
              ? 'scale(1)' 
              : 'scale(1.03)',
          }}
        />

        {/* Dynamic Masking Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-700"
        />

        {/* 100% Complete Victory State */}
        {stats.isCompleted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 text-center p-6 animate-in fade-in duration-700">
            <h3 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-wide">
              ORAH 2026 UNVEILED
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2 font-light max-w-md">
              The sacred vision is completely revealed through the collective generosity of Jesus Youth Pala.
            </p>
          </div>
        )}
      </div>

      {/* Subtle Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 10}px` }}
        >
          <div className="p-2.5 rounded-xl bg-[#0e1015]/95 border border-white/[0.12] text-white shadow-2xl backdrop-blur-xl min-w-[180px]">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">
              Tile #{tooltip.attribution.tileId + 1}
            </div>
            <div className="font-semibold text-xs text-white mt-0.5">
              {tooltip.attribution.contributorName}
            </div>
            <div className="text-[11px] font-mono text-amber-300 mt-1">
              ₹{tooltip.attribution.amount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-2 px-2 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <span>HOVER UNLOCKED TILES FOR ATTRIBUTION</span>
        <span>{stats.revealedTilesCount} OF {stats.totalTiles} ACTIVE</span>
      </div>
    </div>
  );
}
