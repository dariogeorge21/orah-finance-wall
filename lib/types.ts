export type ContributionStatus = 'pending' | 'verified' | 'rejected' | 'failed' | 'expired';

export interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  reference_id: string;
  upi_transaction_id?: string;
  status: ContributionStatus;
  revealed_tile_ids: number[];
  created_at: string;
  verified_at?: string;
  prayer_note?: string;
}

export interface Settings {
  id: number;
  event_name: string;
  target_amount: number;
  upi_vpa: string;
  upi_payee_name: string;
  banner_image_url: string;
  grid_cols: number;
  grid_rows: number;
  is_completed: boolean;
  updated_at: string;
}

export interface TileAttribution {
  tileId: number;
  contributorName: string;
  amount: number;
  timestamp: string;
  referenceId: string;
}

export interface WallStats {
  totalRaised: number;
  targetAmount: number;
  percentage: number;
  totalContributors: number;
  revealedTilesCount: number;
  totalTiles: number;
  pendingCount: number;
  isCompleted: boolean;
}

