export type WearableProvider = 'APPLE_HEALTH' | 'HEALTH_CONNECT' | 'SAMSUNG';

export type WearableDataType = 'hrv' | 'rhr' | 'sleep' | 'menstruation';

// --- DB row types (match Supabase table columns) ---

export interface WearableConnectionRow {
  id: string;
  user_id: string;
  provider: WearableProvider;
  terra_user_id: string | null;
  is_active: boolean;
  connected_at: string;
  last_sync_at: string | null;
  device_names: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface WearableDataRow {
  id: string;
  user_id: string;
  data_type: WearableDataType;
  recorded_at: string;
  provider: WearableProvider;
  payload: HrvPayload | RhrPayload | SleepPayload | MenstruationPayload;
  created_at: string;
  updated_at: string;
}

// --- Payload types for each data_type ---

export interface HrvPayload {
  avg_hrv_sdnn: number | null;
  avg_hrv_rmssd: number | null;
  samples: Array<{ timestamp: string; value: number }>;
}

export interface RhrPayload {
  resting_hr_bpm: number | null;
  avg_hr_bpm: number | null;
  min_hr_bpm: number | null;
  max_hr_bpm: number | null;
}

export interface SleepPayload {
  total_sleep_duration_seconds: number;
  sleep_efficiency: number | null;
  time_in_bed_seconds: number | null;
  sleep_start: string | null;
  sleep_end: string | null;
  rem_seconds: number | null;
  deep_seconds: number | null;
  light_seconds: number | null;
  awake_seconds: number | null;
}

export interface MenstruationPayload {
  cycle_day: number | null;
  period_start: string | null;
  predicted_ovulation: string | null;
  current_phase: string | null;
  flow_intensity: string | null;
  is_predicted_period: boolean | null;
}

// --- Insert/upsert input types (omit server-generated columns) ---

export interface WearableDataInsert {
  user_id: string;
  data_type: WearableDataType;
  recorded_at: string;
  provider: WearableProvider;
  payload: HrvPayload | RhrPayload | SleepPayload | MenstruationPayload;
}

export interface WearableConnectionInsert {
  user_id: string;
  provider: WearableProvider;
  terra_user_id?: string;
  is_active?: boolean;
}
