'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Contribution, Settings, TileAttribution, WallStats } from './types';
import { pickWeightedTiles } from './reveal-algorithm';
import { sounds } from './audio';
import { supabase, isSupabaseConfigured } from './supabase';
import confetti from 'canvas-confetti';

interface WallContextType {
  settings: Settings;
  contributions: Contribution[];
  verifiedContributions: Contribution[];
  pendingContributions: Contribution[];
  stats: WallStats;
  revealedTileSet: Set<number>;
  tileAttributionMap: Map<number, TileAttribution>;
  recentVerified: Contribution[];
  topContributors: { name: string; totalAmount: number; count: number }[];
  isRealtimeConnected: boolean;
  submitPendingContribution: (params: {
    contributorName: string;
    amount: number;
    upiTransactionId: string;
    prayerNote?: string;
  }) => Promise<Contribution>;
  verifyContribution: (id: string) => Promise<void>;
  rejectContribution: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  simulateContribution: (amount: number, name?: string) => Promise<void>;
  resetWall: () => Promise<void>;
  lastVerifiedEvent: Contribution | null;
}

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  event_name: process.env.NEXT_PUBLIC_DEFAULT_EVENT_NAME || 'ORAH 2026',
  target_amount: Number(process.env.NEXT_PUBLIC_DEFAULT_TARGET_AMOUNT) || 100000,
  upi_vpa: process.env.NEXT_PUBLIC_DEFAULT_UPI_VPA || '7838403506@rapl',
  upi_payee_name: process.env.NEXT_PUBLIC_DEFAULT_UPI_PAYEE || 'Dario George',
  banner_image_url: '/jesusAndChildren.jpg',
  grid_cols: 40,
  grid_rows: 24,
  is_completed: false,
  updated_at: new Date().toISOString(),
};

// Realistic initial sample data to make the page immediately stunning upon first view
const INITIAL_SAMPLE_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'seed-1',
    contributor_name: 'Jesus Youth St. Thomas',
    amount: 10000,
    reference_id: 'ORAH-INIT-01',
    upi_transaction_id: '428901239845',
    status: 'verified',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    verified_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seed-2',
    contributor_name: 'Albin & Sneha',
    amount: 5000,
    reference_id: 'ORAH-INIT-02',
    upi_transaction_id: '428912384756',
    status: 'verified',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    verified_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'seed-3',
    contributor_name: 'Maria George',
    amount: 2500,
    reference_id: 'ORAH-INIT-03',
    upi_transaction_id: '428945672314',
    status: 'verified',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    verified_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'seed-4',
    contributor_name: 'Thomas K.',
    amount: 1000,
    reference_id: 'ORAH-INIT-04',
    upi_transaction_id: '428987654321',
    status: 'verified',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    verified_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'seed-5',
    contributor_name: 'JY Pala Parish Angels',
    amount: 7500,
    reference_id: 'ORAH-INIT-05',
    upi_transaction_id: '428934567890',
    status: 'verified',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 1800000).toISOString(),
    verified_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'seed-pending-1',
    contributor_name: 'Anonymous Supporter',
    amount: 500,
    reference_id: 'ORAH-PEND-01',
    upi_transaction_id: '429012345678',
    status: 'pending',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 600000).toISOString(),
    prayer_note: 'For the youth of Pala diocese',
  },
  {
    id: 'seed-pending-2',
    contributor_name: 'Joel Mathew',
    amount: 2000,
    reference_id: 'ORAH-PEND-02',
    upi_transaction_id: '429098765432',
    status: 'pending',
    revealed_tile_ids: [],
    created_at: new Date(Date.now() - 180000).toISOString(),
    prayer_note: 'Blessing for ORAH 2026',
  }
];

// Pre-assign organic tiles to seed data
function initializeSeedTiles(contributions: Contribution[], settings: Settings): Contribution[] {
  const revealedSet = new Set<number>();
  const totalTiles = settings.grid_cols * settings.grid_rows;

  return contributions.map(c => {
    if (c.status === 'verified' && (!c.revealed_tile_ids || c.revealed_tile_ids.length === 0)) {
      const count = Math.max(1, Math.round((c.amount / settings.target_amount) * totalTiles));
      const newlyPicked = pickWeightedTiles(revealedSet, count, settings.grid_cols, settings.grid_rows);
      newlyPicked.forEach(id => revealedSet.add(id));
      return { ...c, revealed_tile_ids: newlyPicked };
    }
    return c;
  });
}

const WallContext = createContext<WallContextType | undefined>(undefined);

export function WallProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastVerifiedEvent, setLastVerifiedEvent] = useState<Contribution | null>(null);

  // Initialize data from LocalStorage or Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Settings
    const savedSettings = localStorage.getItem('orah_settings_v1');
    let activeSettings = DEFAULT_SETTINGS;
    if (savedSettings) {
      try {
        activeSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
        if (activeSettings.banner_image_url === '/orah-banner.svg' || activeSettings.banner_image_url === '/orah-banner.jpg') {
          activeSettings.banner_image_url = '/jesusAndChildren.jpg';
        }
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    setSettings(activeSettings);

    // Load Contributions
    const savedContribs = localStorage.getItem('orah_contributions_v1');
    if (savedContribs) {
      try {
        const parsed = JSON.parse(savedContribs) as Contribution[];
        setContributions(parsed);
      } catch (e) {
        console.error('Failed to parse saved contributions', e);
        const seeded = initializeSeedTiles(INITIAL_SAMPLE_CONTRIBUTIONS, activeSettings);
        setContributions(seeded);
      }
    } else {
      const seeded = initializeSeedTiles(INITIAL_SAMPLE_CONTRIBUTIONS, activeSettings);
      setContributions(seeded);
      localStorage.setItem('orah_contributions_v1', JSON.stringify(seeded));
    }

    // Connect to Supabase Realtime if configured
    if (isSupabaseConfigured && supabase) {
      setIsRealtimeConnected(true);

      // Fetch active settings from Supabase
      supabase
        .from('fw_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setSettings(prev => ({ ...prev, ...data }));
          }
        });

      // Fetch verified contributions from Supabase — prayer_note is strictly omitted for end-user privacy!
      supabase
        .from('fw_contributions')
        .select('id, contributor_name, amount, reference_id, status, revealed_tile_ids, created_at, verified_at')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setContributions(data);
          }
        });

      const channel = supabase
        .channel('public:fw_contributions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'fw_contributions' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newRow = payload.new as Contribution;
              // Strip prayer_note on public client for privacy
              const sanitizedRow = { ...newRow, prayer_note: undefined };
              setContributions(prev => {
                if (prev.some(c => c.id === sanitizedRow.id)) return prev;
                return [sanitizedRow, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedRow = payload.new as Contribution;
              const sanitizedRow = { ...updatedRow, prayer_note: undefined };
              setContributions(prev => prev.map(c => c.id === sanitizedRow.id ? sanitizedRow : c));
              if (updatedRow.status === 'verified') {
                setLastVerifiedEvent(sanitizedRow);
                sounds.playSplash();
                sounds.playAdminApprove();
              }
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      setIsRealtimeConnected(true); // Connected to local broadcast
    }
  }, []);

  // Save to localStorage whenever contributions or settings change
  useEffect(() => {
    if (typeof window !== 'undefined' && contributions.length > 0) {
      localStorage.setItem('orah_contributions_v1', JSON.stringify(contributions));
    }
  }, [contributions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orah_settings_v1', JSON.stringify(settings));
    }
  }, [settings]);

  // Derived lists and stats
  const verifiedContributions = useMemo(() => {
    return contributions.filter(c => c.status === 'verified');
  }, [contributions]);

  const pendingContributions = useMemo(() => {
    return contributions.filter(c => c.status === 'pending');
  }, [contributions]);

  const revealedTileSet = useMemo(() => {
    const set = new Set<number>();
    verifiedContributions.forEach(c => {
      if (Array.isArray(c.revealed_tile_ids)) {
        c.revealed_tile_ids.forEach(id => set.add(id));
      }
    });
    return set;
  }, [verifiedContributions]);

  const tileAttributionMap = useMemo(() => {
    const map = new Map<number, TileAttribution>();
    verifiedContributions.forEach(c => {
      if (Array.isArray(c.revealed_tile_ids)) {
        c.revealed_tile_ids.forEach(id => {
          map.set(id, {
            tileId: id,
            contributorName: c.contributor_name || 'Anonymous Supporter',
            amount: c.amount,
            timestamp: c.verified_at || c.created_at,
            referenceId: c.reference_id,
          });
        });
      }
    });
    return map;
  }, [verifiedContributions]);

  const stats: WallStats = useMemo(() => {
    const totalRaised = verifiedContributions.reduce((acc, c) => acc + Number(c.amount), 0);
    const targetAmount = Number(settings.target_amount) || 150000;
    const percentage = Math.min(100, (totalRaised / targetAmount) * 100);
    const totalTiles = settings.grid_cols * settings.grid_rows;
    const isCompleted = totalRaised >= targetAmount;

    return {
      totalRaised,
      targetAmount,
      percentage: Number(percentage.toFixed(1)),
      totalContributors: verifiedContributions.length,
      revealedTilesCount: revealedTileSet.size,
      totalTiles,
      pendingCount: pendingContributions.length,
      isCompleted,
    };
  }, [verifiedContributions, pendingContributions, settings, revealedTileSet]);

  const recentVerified = useMemo(() => {
    return [...verifiedContributions].sort((a, b) => {
      const timeA = new Date(a.verified_at || a.created_at).getTime();
      const timeB = new Date(b.verified_at || b.created_at).getTime();
      return timeB - timeA;
    });
  }, [verifiedContributions]);

  const topContributors = useMemo(() => {
    const map = new Map<string, { name: string; totalAmount: number; count: number }>();
    verifiedContributions.forEach(c => {
      const name = c.contributor_name?.trim() || 'Anonymous';
      const existing = map.get(name) || { name, totalAmount: 0, count: 0 };
      map.set(name, {
        name,
        totalAmount: existing.totalAmount + Number(c.amount),
        count: existing.count + 1,
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }, [verifiedContributions]);

  // Submit a pending contribution
  const submitPendingContribution = useCallback(async (params: {
    contributorName: string;
    amount: number;
    upiTransactionId: string;
    prayerNote?: string;
  }): Promise<Contribution> => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceId = `ORAH-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    let newContrib: Contribution = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `contrib-${Date.now()}-${randomSuffix}`,
      contributor_name: params.contributorName.trim() || 'Anonymous Supporter',
      amount: params.amount,
      reference_id: referenceId,
      upi_transaction_id: params.upiTransactionId.trim(),
      status: 'pending',
      revealed_tile_ids: [],
      created_at: new Date().toISOString(),
    };

    // Log directly to the database via server API using service role key
    try {
      const res = await fetch('/api/contributions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributorName: params.contributorName,
          amount: params.amount,
          upiTransactionId: params.upiTransactionId,
          prayerNote: params.prayerNote,
          referenceId,
        }),
      });
      const data = await res.json();
      if (data.success && data.contribution) {
        newContrib = {
          ...data.contribution,
          prayer_note: undefined, // Strictly omitted on public client for privacy
        };
      }
    } catch (err) {
      console.warn('Failed to insert via server API, saving locally', err);
    }

    setContributions(prev => [newContrib, ...prev]);
    sounds.playSuccessChime();

    return newContrib;
  }, []);

  // Admin verifies a pending contribution -> actual live reflection happens here!
  const verifyContribution = useCallback(async (id: string) => {
    setContributions(prev => {
      const target = prev.find(c => c.id === id);
      if (!target || target.status === 'verified') return prev;

      // Calculate how many tiles this contribution unlocks
      const totalTiles = settings.grid_cols * settings.grid_rows;
      const countToReveal = Math.max(1, Math.round((target.amount / settings.target_amount) * totalTiles));

      // Calculate currently revealed set from other verified contributions
      const currentRevealed = new Set<number>();
      prev.forEach(c => {
        if (c.status === 'verified' && Array.isArray(c.revealed_tile_ids)) {
          c.revealed_tile_ids.forEach(t => currentRevealed.add(t));
        }
      });

      // Pick organic weighted tiles
      const newTiles = pickWeightedTiles(currentRevealed, countToReveal, settings.grid_cols, settings.grid_rows);

      const verifiedRecord: Contribution = {
        ...target,
        status: 'verified',
        verified_at: new Date().toISOString(),
        revealed_tile_ids: newTiles,
      };

      setLastVerifiedEvent(verifiedRecord);

      // Audio and tactile cues
      sounds.playSplash();
      sounds.playAdminApprove();

      // Check if this triggers milestone or 100% completion
      const prevTotal = prev.filter(c => c.status === 'verified').reduce((acc, c) => acc + c.amount, 0);
      const newTotal = prevTotal + target.amount;
      if (newTotal >= settings.target_amount) {
        sounds.playCelebration();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#06b6d4', '#ec4899', '#ffffff'],
        });
      } else {
        // Mini celebration burst
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff'],
        });
      }

      // Trigger server-side verification using service role API
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dario@jesusyouthpala',
        },
        body: JSON.stringify({ contributionId: id, action: 'verify' }),
      }).catch(err => console.warn('Server verify error', err));

      return prev.map(c => c.id === id ? verifiedRecord : c);
    });
  }, [settings]);

  // Reject a contribution
  const rejectContribution = useCallback(async (id: string) => {
    setContributions(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, status: 'rejected' as const } : c);
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dario@jesusyouthpala',
        },
        body: JSON.stringify({ contributionId: id, action: 'reject' }),
      }).catch(err => console.warn('Server reject error', err));
      return updated;
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings, updated_at: new Date().toISOString() };
      if (isSupabaseConfigured && supabase) {
        supabase.from('fw_settings').update(updated).eq('id', 1).then();
      }
      return updated;
    });
  }, []);

  // Quick simulation helper for admin testing
  const simulateContribution = useCallback(async (amount: number, name?: string) => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const mockPending = await submitPendingContribution({
      contributorName: name || `Supporter #${Math.floor(100 + Math.random() * 900)}`,
      amount,
      upiTransactionId: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      prayerNote: 'Simulated contribution',
    });

    // Auto-verify right away if simulated
    setTimeout(() => {
      verifyContribution(mockPending.id);
    }, 600);
  }, [submitPendingContribution, verifyContribution]);

  // Reset wall to clean state
  const resetWall = useCallback(async () => {
    const resetContribs = initializeSeedTiles(INITIAL_SAMPLE_CONTRIBUTIONS.slice(0, 3), settings);
    setContributions(resetContribs);
    localStorage.setItem('orah_contributions_v1', JSON.stringify(resetContribs));
  }, [settings]);

  return (
    <WallContext.Provider
      value={{
        settings,
        contributions,
        verifiedContributions,
        pendingContributions,
        stats,
        revealedTileSet,
        tileAttributionMap,
        recentVerified,
        topContributors,
        isRealtimeConnected,
        submitPendingContribution,
        verifyContribution,
        rejectContribution,
        updateSettings,
        simulateContribution,
        resetWall,
        lastVerifiedEvent,
      }}
    >
      {children}
    </WallContext.Provider>
  );
}

export function useWall() {
  const context = useContext(WallContext);
  if (!context) {
    throw new Error('useWall must be used within a WallProvider');
  }
  return context;
}
