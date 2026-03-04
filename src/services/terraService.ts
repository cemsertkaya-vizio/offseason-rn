import {
  initTerra,
  initConnection,
  checkAuth,
  getBody,
  getSleep,
  getDaily,
  getMenstruation,
  getUserId,
  Connections,
  CustomPermissions,
} from 'terra-react';
import { Platform } from 'react-native';
import { TERRA_DEV_ID } from '@env';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import type { WearableProvider } from '../types/wearable';
import type { SuccessMessage, DataMessage, GetUserId } from 'terra-react';

const connectionMap: Record<WearableProvider, Connections> = {
  APPLE_HEALTH: Connections.APPLE_HEALTH,
  HEALTH_CONNECT: Connections.HEALTH_CONNECT,
  SAMSUNG: Connections.SAMSUNG,
};

const REQUIRED_PERMISSIONS: CustomPermissions[] = [
  CustomPermissions.HEART_RATE,
  CustomPermissions.HEART_RATE_VARIABILITY,
  CustomPermissions.RESTING_HEART_RATE,
  CustomPermissions.SLEEP_ANALYSIS,
  CustomPermissions.STEPS,
  CustomPermissions.CALORIES,
  CustomPermissions.ACTIVE_DURATIONS,
  CustomPermissions.MENSTRUATION,
];

export const terraService = {
  generateToken: async (): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> => {
    try {
      console.log('terraService - Generating auth token via Edge Function');
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/terra-generate-token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();
        console.log(
          'terraService - Edge Function error:',
          response.status,
          text,
        );
        return { success: false, error: `Token request failed: ${response.status}` };
      }

      const data = await response.json();

      if (!data?.token) {
        console.log('terraService - No token in response');
        return { success: false, error: 'No token returned' };
      }

      console.log('terraService - Generated auth token successfully');
      return { success: true, token: data.token };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'terraService - Exception generating token:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  initialize: async (
    referenceId: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('terraService - Initializing Terra SDK');
      const result: SuccessMessage = await initTerra(
        TERRA_DEV_ID,
        referenceId,
      );
      console.log('terraService - Init result:', JSON.stringify(result));
      return { success: result.success };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('terraService - Exception initializing:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  connect: async (
    provider: WearableProvider,
    token: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('terraService - Connecting to provider:', provider);
      console.log('terraService - Token length:', token.length);
      const connection = connectionMap[provider];

      // Check auth status before connecting
      const authCheck = await checkAuth(connection, TERRA_DEV_ID);
      console.log('terraService - checkAuth result:', JSON.stringify(authCheck));

      const result: SuccessMessage = await initConnection(
        connection,
        token,
        false,
        REQUIRED_PERMISSIONS,
        '',
      );
      console.log('terraService - Connection result:', JSON.stringify(result));
      return { success: result.success };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('terraService - Exception connecting:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getTerraUserId: async (
    provider: WearableProvider,
  ): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      console.log('terraService - Getting Terra user ID for:', provider);
      const connection = connectionMap[provider];
      const result: GetUserId = await getUserId(connection);
      console.log('terraService - User ID result:', JSON.stringify(result));
      return { success: result.success, userId: result.userId ?? undefined };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('terraService - Exception getting user ID:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  fetchBodyData: async (
    provider: WearableProvider,
    startDate: Date,
    endDate: Date,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log(
        'terraService - Fetching body data from',
        startDate.toISOString(),
        'to',
        endDate.toISOString(),
      );
      const connection = connectionMap[provider];
      const result: DataMessage = await getBody(
        connection,
        startDate,
        endDate,
        false,
        false,
      );
      console.log(
        'terraService - Body data fetched, success:',
        result?.success,
      );
      console.log(
        'terraService - Body raw data keys:',
        result?.data ? JSON.stringify(Object.keys(result.data)).slice(0, 200) : 'null',
      );
      console.log(
        'terraService - Body raw data sample:',
        JSON.stringify(result?.data)?.slice(0, 500),
      );
      if (!result?.success) {
        return {
          success: false,
          error: result?.error || 'Failed to fetch body data',
        };
      }
      // Terra wraps entries in { type, status, data: [...entries], user }
      const parsed = result.data as any;
      const entries = parsed?.data ?? parsed;
      return { success: true, data: entries };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('terraService - Exception fetching body data:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  fetchDailyData: async (
    provider: WearableProvider,
    startDate: Date,
    endDate: Date,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log(
        'terraService - Fetching daily data from',
        startDate.toISOString(),
        'to',
        endDate.toISOString(),
      );
      const connection = connectionMap[provider];
      const result: DataMessage = await getDaily(
        connection,
        startDate,
        endDate,
        false,
      );
      console.log(
        'terraService - Daily data fetched, success:',
        result?.success,
      );
      console.log(
        'terraService - Daily raw data sample:',
        JSON.stringify(result?.data)?.slice(0, 500),
      );
      if (!result?.success) {
        return {
          success: false,
          error: result?.error || 'Failed to fetch daily data',
        };
      }
      const parsed = result.data as any;
      const entries = parsed?.data ?? parsed;
      return { success: true, data: entries };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'terraService - Exception fetching daily data:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  fetchSleepData: async (
    provider: WearableProvider,
    startDate: Date,
    endDate: Date,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log(
        'terraService - Fetching sleep data from',
        startDate.toISOString(),
        'to',
        endDate.toISOString(),
      );
      const connection = connectionMap[provider];
      const result: DataMessage = await getSleep(
        connection,
        startDate,
        endDate,
        false,
      );
      console.log(
        'terraService - Sleep data fetched, success:',
        result?.success,
      );
      console.log(
        'terraService - Sleep raw data sample:',
        JSON.stringify(result?.data)?.slice(0, 500),
      );
      if (!result?.success) {
        return {
          success: false,
          error: result?.error || 'Failed to fetch sleep data',
        };
      }
      const parsed = result.data as any;
      const entries = parsed?.data ?? parsed;
      return { success: true, data: entries };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'terraService - Exception fetching sleep data:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  fetchMenstruationData: async (
    provider: WearableProvider,
    startDate: Date,
    endDate: Date,
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      console.log(
        'terraService - Fetching menstruation data from',
        startDate.toISOString(),
        'to',
        endDate.toISOString(),
      );
      const connection = connectionMap[provider];
      const result: DataMessage = await getMenstruation(
        connection,
        startDate,
        endDate,
        false,
      );
      console.log(
        'terraService - Menstruation data fetched, success:',
        result?.success,
      );
      if (!result?.success) {
        return {
          success: false,
          error: result?.error || 'Failed to fetch menstruation data',
        };
      }
      const parsed = result.data as any;
      const entries = parsed?.data ?? parsed;
      return { success: true, data: entries };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(
        'terraService - Exception fetching menstruation data:',
        errorMessage,
      );
      return { success: false, error: errorMessage };
    }
  },

  getDefaultProvider: (): WearableProvider => {
    return Platform.OS === 'ios' ? 'APPLE_HEALTH' : 'HEALTH_CONNECT';
  },
};
