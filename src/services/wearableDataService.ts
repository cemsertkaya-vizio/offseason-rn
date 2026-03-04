import { supabase } from '../config/supabase';
import type {
  WearableProvider,
  WearableConnectionRow,
  WearableConnectionInsert,
  WearableDataInsert,
  WearableDataRow,
  WearableDataType,
  HrvPayload,
  RhrPayload,
  SleepPayload,
  MenstruationPayload,
} from '../types/wearable';

export const wearableDataService = {
  // ---- Connection management ----

  saveConnection: async (
    data: WearableConnectionInsert,
  ): Promise<{
    success: boolean;
    connection?: WearableConnectionRow;
    error?: string;
  }> => {
    try {
      console.log(
        'wearableDataService - Saving connection for provider:',
        data.provider,
      );
      const { data: row, error } = await supabase
        .from('wearable_connections')
        .upsert(data, { onConflict: 'user_id,provider' })
        .select()
        .single();

      if (error) {
        console.log(
          'wearableDataService - Error saving connection:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      console.log('wearableDataService - Connection saved successfully');
      return { success: true, connection: row };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception saving connection:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  getActiveConnection: async (
    userId: string,
  ): Promise<{
    success: boolean;
    connection?: WearableConnectionRow;
    error?: string;
  }> => {
    try {
      console.log(
        'wearableDataService - Fetching active connection for user:',
        userId,
      );
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('connected_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log(
          'wearableDataService - Error fetching connection:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      console.log('wearableDataService - Connection fetched:', !!data);
      return { success: true, connection: data ?? undefined };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception fetching connection:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  disconnectProvider: async (
    userId: string,
    provider: WearableProvider,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(
        'wearableDataService - Disconnecting provider:',
        provider,
      );
      const { error } = await supabase
        .from('wearable_connections')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) {
        console.log(
          'wearableDataService - Error disconnecting:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      console.log('wearableDataService - Disconnected successfully');
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception disconnecting:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  updateLastSyncAt: async (
    userId: string,
    provider: WearableProvider,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('wearableDataService - Updating last_sync_at');
      const { error } = await supabase
        .from('wearable_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) {
        console.log(
          'wearableDataService - Error updating last_sync_at:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception updating last_sync_at:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  updateDeviceNames: async (
    userId: string,
    provider: WearableProvider,
    deviceNames: string[],
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(
        'wearableDataService - Updating device_names:',
        deviceNames,
      );
      const { error } = await supabase
        .from('wearable_connections')
        .update({ device_names: deviceNames })
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) {
        console.log(
          'wearableDataService - Error updating device_names:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception updating device_names:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  // ---- Data persistence (upsert per day) ----

  saveWearableData: async (
    records: WearableDataInsert[],
  ): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
      console.log(
        'wearableDataService - Saving',
        records.length,
        'wearable data records',
      );
      const { data, error } = await supabase
        .from('wearable_data')
        .upsert(records, { onConflict: 'user_id,data_type,recorded_at' })
        .select();

      if (error) {
        console.log(
          'wearableDataService - Error saving data:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      console.log('wearableDataService - Saved', data?.length, 'records');
      return { success: true, count: data?.length ?? 0 };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception saving data:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  getWearableData: async (
    userId: string,
    dataType: WearableDataType,
    startDate: string,
    endDate: string,
  ): Promise<{
    success: boolean;
    data?: WearableDataRow[];
    error?: string;
  }> => {
    try {
      console.log(
        'wearableDataService - Fetching',
        dataType,
        'data for user:',
        userId,
      );
      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.log(
          'wearableDataService - Error fetching data:',
          error.message,
        );
        return { success: false, error: error.message };
      }
      console.log(
        'wearableDataService - Fetched',
        data?.length,
        'records',
      );
      return { success: true, data: data ?? [] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableDataService - Exception fetching data:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  // ---- Transform helpers: Terra raw data -> typed payloads ----

  transformBodyToHrv: (bodyData: any): HrvPayload => {
    const heartRateData = bodyData?.heart_rate_data;
    const summary = heartRateData?.summary ?? {};
    const detailed = heartRateData?.detailed ?? {};

    // HRV samples can be under detailed.hrv_samples_sdnn or directly under heartRateData
    const rawSamples =
      detailed?.hrv_samples_sdnn ??
      heartRateData?.hrv_samples_sdnn ??
      [];
    const samples = rawSamples.map((s: any) => ({
      timestamp: s.timestamp ?? s.timer_duration_seconds ?? '',
      value: s.hrv_sdnn ?? s.hrv ?? s.value ?? 0,
    }));

    console.log(
      'wearableDataService - transformBodyToHrv summary keys:',
      Object.keys(summary),
    );
    console.log(
      'wearableDataService - transformBodyToHrv detailed keys:',
      Object.keys(detailed),
    );

    return {
      avg_hrv_sdnn: summary.avg_hrv_sdnn ?? null,
      avg_hrv_rmssd: summary.avg_hrv_rmssd ?? null,
      samples,
    };
  },

  transformBodyToRhr: (bodyData: any): RhrPayload => {
    const heartRateData = bodyData?.heart_rate_data;
    const summary = heartRateData?.summary ?? {};

    console.log(
      'wearableDataService - transformBodyToRhr summary:',
      JSON.stringify(summary).slice(0, 300),
    );

    return {
      resting_hr_bpm: summary.resting_hr_bpm ?? null,
      avg_hr_bpm: summary.avg_hr_bpm ?? null,
      min_hr_bpm: summary.min_hr_bpm ?? null,
      max_hr_bpm: summary.max_hr_bpm ?? null,
    };
  },

  transformSleep: (sleepData: any): SleepPayload => {
    const d = sleepData ?? {};
    const durations = d.sleep_durations_data ?? {};
    const asleep = durations?.asleep ?? {};
    const awake = durations?.awake ?? {};
    const other = durations?.other ?? {};

    console.log(
      'wearableDataService - transformSleep keys:',
      Object.keys(d),
    );
    console.log(
      'wearableDataService - transformSleep durations:',
      JSON.stringify(durations).slice(0, 300),
    );

    return {
      total_sleep_duration_seconds:
        asleep?.duration_asleep_state_seconds ??
        other?.duration_in_bed_seconds ??
        0,
      sleep_efficiency: d.efficiency ?? d.sleep_efficiency ?? null,
      time_in_bed_seconds:
        other?.duration_in_bed_seconds ?? null,
      sleep_start:
        d.metadata?.start_time ?? null,
      sleep_end:
        d.metadata?.end_time ?? null,
      rem_seconds:
        asleep?.duration_REM_sleep_state_seconds ?? null,
      deep_seconds:
        asleep?.duration_deep_sleep_state_seconds ?? null,
      light_seconds:
        asleep?.duration_light_sleep_state_seconds ?? null,
      awake_seconds:
        awake?.duration_awake_state_seconds ?? null,
    };
  },

  transformDailyToHrv: (dailyData: any): HrvPayload => {
    const heartRateData = dailyData?.heart_rate_data;
    const summary = heartRateData?.summary ?? {};
    const detailed = heartRateData?.detailed ?? {};

    const rawSamples =
      detailed?.hrv_samples_sdnn ??
      heartRateData?.hrv_samples_sdnn ??
      [];
    const samples = rawSamples.map((s: any) => ({
      timestamp: s.timestamp ?? '',
      value: s.hrv_sdnn ?? s.hrv ?? s.value ?? 0,
    }));

    console.log(
      'wearableDataService - transformDailyToHrv summary:',
      JSON.stringify(summary).slice(0, 300),
    );

    return {
      avg_hrv_sdnn: summary.avg_hrv_sdnn ?? null,
      avg_hrv_rmssd: summary.avg_hrv_rmssd ?? null,
      samples,
    };
  },

  transformDailyToRhr: (dailyData: any): RhrPayload => {
    const heartRateData = dailyData?.heart_rate_data;
    const summary = heartRateData?.summary ?? {};

    console.log(
      'wearableDataService - transformDailyToRhr summary:',
      JSON.stringify(summary).slice(0, 300),
    );

    return {
      resting_hr_bpm: summary.resting_hr_bpm ?? null,
      avg_hr_bpm: summary.avg_hr_bpm ?? null,
      min_hr_bpm: summary.min_hr_bpm ?? null,
      max_hr_bpm: summary.max_hr_bpm ?? null,
    };
  },

  transformMenstruation: (menstruationData: any): MenstruationPayload => {
    const d = menstruationData ?? {};
    return {
      cycle_day: d.day_in_cycle ?? null,
      period_start: d.period_start ?? null,
      predicted_ovulation: d.predicted_ovulation ?? null,
      current_phase: d.current_phase ?? null,
      flow_intensity: d.menstrual_flow?.flow ?? null,
      is_predicted_period: d.is_predicted_cycle ?? null,
    };
  },
};
