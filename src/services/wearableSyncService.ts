import { terraService } from './terraService';
import { wearableDataService } from './wearableDataService';
import type { WearableProvider, WearableDataInsert } from '../types/wearable';

// Keep only the last (most complete) record per (data_type, recorded_at)
const deduplicateRecords = (
  records: WearableDataInsert[],
): WearableDataInsert[] => {
  const map = new Map<string, WearableDataInsert>();
  for (const record of records) {
    const key = `${record.data_type}::${record.recorded_at}`;
    map.set(key, record);
  }
  return Array.from(map.values());
};

const extractDeviceNames = (entries: any[]): string[] => {
  const names = new Set<string>();
  for (const entry of entries) {
    const deviceData = entry?.device_data;
    if (!deviceData) {
      continue;
    }

    // Primary device name (e.g. "iPhone")
    if (deviceData.name && typeof deviceData.name === 'string') {
      names.add(deviceData.name);
    }

    // Other connected devices (e.g. "Cem's Apple Watch")
    const otherDevices = deviceData.other_devices;
    if (Array.isArray(otherDevices)) {
      for (const device of otherDevices) {
        if (device?.name && typeof device.name === 'string') {
          names.add(device.name);
        }
      }
    }
  }
  return Array.from(names);
};

export const wearableSyncService = {
  syncAllData: async (
    userId: string,
    provider: WearableProvider,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    success: boolean;
    count?: number;
    deviceNames?: string[];
    error?: string;
  }> => {
    try {
      console.log(
        'wearableSyncService - Starting full sync for user:',
        userId,
      );
      const records: WearableDataInsert[] = [];
      const allEntries: any[] = [];
      const fallbackDate = startDate.toISOString().split('T')[0];

      // 1. Fetch daily data (HRV + RHR) — Apple Health provides heart rate via daily endpoint
      const dailyResult = await terraService.fetchDailyData(
        provider,
        startDate,
        endDate,
      );
      if (dailyResult.success && dailyResult.data) {
        const dailyEntries = Array.isArray(dailyResult.data)
          ? dailyResult.data
          : [dailyResult.data];

        allEntries.push(...dailyEntries);

        for (const entry of dailyEntries) {
          const entryDate = entry?.metadata?.start_time
            ? entry.metadata.start_time.split('T')[0]
            : fallbackDate;

          const hrvPayload = wearableDataService.transformDailyToHrv(entry);
          const rhrPayload = wearableDataService.transformDailyToRhr(entry);

          console.log(
            'wearableSyncService - HRV payload:',
            JSON.stringify(hrvPayload),
          );
          console.log(
            'wearableSyncService - RHR payload:',
            JSON.stringify(rhrPayload),
          );

          // Only save if we have actual heart rate data
          const hasHrvData =
            hrvPayload.avg_hrv_sdnn !== null ||
            hrvPayload.avg_hrv_rmssd !== null ||
            hrvPayload.samples.length > 0;
          const hasRhrData =
            rhrPayload.resting_hr_bpm !== null ||
            rhrPayload.avg_hr_bpm !== null;

          if (hasHrvData) {
            records.push({
              user_id: userId,
              data_type: 'hrv',
              recorded_at: entryDate,
              provider,
              payload: hrvPayload,
            });
          }

          if (hasRhrData) {
            records.push({
              user_id: userId,
              data_type: 'rhr',
              recorded_at: entryDate,
              provider,
              payload: rhrPayload,
            });
          }
        }
      }

      // 2. Fetch sleep data
      const sleepResult = await terraService.fetchSleepData(
        provider,
        startDate,
        endDate,
      );
      if (sleepResult.success && sleepResult.data) {
        const sleepEntries = Array.isArray(sleepResult.data)
          ? sleepResult.data
          : [sleepResult.data];

        allEntries.push(...sleepEntries);

        for (const entry of sleepEntries) {
          const entryDate = entry?.metadata?.start_time
            ? entry.metadata.start_time.split('T')[0]
            : fallbackDate;

          const sleepPayload = wearableDataService.transformSleep(entry);

          const hasSleepData =
            sleepPayload.total_sleep_duration_seconds > 0 ||
            sleepPayload.rem_seconds !== null ||
            sleepPayload.deep_seconds !== null;

          if (hasSleepData) {
            records.push({
              user_id: userId,
              data_type: 'sleep',
              recorded_at: entryDate,
              provider,
              payload: sleepPayload,
            });
          }
        }
      }

      // 3. Fetch menstruation data
      const menstResult = await terraService.fetchMenstruationData(
        provider,
        startDate,
        endDate,
      );
      if (menstResult.success && menstResult.data) {
        const menstEntries = Array.isArray(menstResult.data)
          ? menstResult.data
          : [menstResult.data];

        allEntries.push(...menstEntries);

        for (const entry of menstEntries) {
          if (entry) {
            const entryDate = entry?.metadata?.start_time
              ? entry.metadata.start_time.split('T')[0]
              : fallbackDate;

            const menstPayload =
              wearableDataService.transformMenstruation(entry);

            const hasMenstData =
              menstPayload.cycle_day !== null ||
              menstPayload.period_start !== null ||
              menstPayload.current_phase !== null;

            if (hasMenstData) {
              records.push({
                user_id: userId,
                data_type: 'menstruation',
                recorded_at: entryDate,
                provider,
                payload: menstPayload,
              });
            }
          }
        }
      }

      // 4. Extract device names from all fetched entries
      const deviceNames = extractDeviceNames(allEntries);
      console.log(
        'wearableSyncService - Discovered devices:',
        deviceNames,
      );

      // 5. Deduplicate and upsert all records to Supabase
      const uniqueRecords = deduplicateRecords(records);
      console.log(
        'wearableSyncService - Records before dedup:',
        records.length,
        'after:',
        uniqueRecords.length,
      );

      if (uniqueRecords.length === 0) {
        console.log('wearableSyncService - No records to save');
        return { success: true, count: 0, deviceNames };
      }

      const saveResult =
        await wearableDataService.saveWearableData(uniqueRecords);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      // 6. Update last_sync_at and device_names on the connection
      await wearableDataService.updateLastSyncAt(userId, provider);
      if (deviceNames.length > 0) {
        await wearableDataService.updateDeviceNames(
          userId,
          provider,
          deviceNames,
        );
      }

      console.log(
        'wearableSyncService - Sync complete, saved',
        saveResult.count,
        'records',
      );
      return { success: true, count: saveResult.count, deviceNames };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'wearableSyncService - Exception during sync:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  syncToday: async (
    userId: string,
    provider: WearableProvider,
  ): Promise<{
    success: boolean;
    count?: number;
    deviceNames?: string[];
    error?: string;
  }> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    console.log(
      'wearableSyncService - syncToday range:',
      startDate.toISOString(),
      'to',
      endDate.toISOString(),
    );
    return wearableSyncService.syncAllData(
      userId,
      provider,
      startDate,
      endDate,
    );
  },
};
