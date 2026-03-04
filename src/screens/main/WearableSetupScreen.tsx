import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { terraService } from '../../services/terraService';
import { wearableDataService } from '../../services/wearableDataService';
import { wearableSyncService } from '../../services/wearableSyncService';
import { RootStackParamList } from '../../types/navigation';
import type {
  WearableProvider,
  WearableConnectionRow,
} from '../../types/wearable';

type WearableSetupNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const PROVIDER_LABELS: Record<WearableProvider, string> = {
  APPLE_HEALTH: 'Apple Health',
  HEALTH_CONNECT: 'Health Connect',
  SAMSUNG: 'Samsung Health',
};

export const WearableSetupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<WearableSetupNavigationProp>();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeConnection, setActiveConnection] =
    useState<WearableConnectionRow | null>(null);

  const defaultProvider = terraService.getDefaultProvider();

  const loadConnectionStatus = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    console.log('WearableSetupScreen - Loading connection status');
    const result = await wearableDataService.getActiveConnection(user.id);
    if (result.success && result.connection) {
      setActiveConnection(result.connection);
    } else {
      setActiveConnection(null);
    }
    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadConnectionStatus();
    }, [loadConnectionStatus]),
  );

  const handleConnect = async (provider: WearableProvider) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsConnecting(true);
    console.log('WearableSetupScreen - Starting connection for:', provider);

    // 1. Initialize Terra SDK
    const initResult = await terraService.initialize(user.id);
    if (!initResult.success) {
      setIsConnecting(false);
      Alert.alert('Error', initResult.error || 'Failed to initialize Terra');
      return;
    }

    // 2. Generate auth token
    const tokenResult = await terraService.generateToken();
    if (!tokenResult.success || !tokenResult.token) {
      setIsConnecting(false);
      Alert.alert(
        'Error',
        tokenResult.error || 'Failed to generate auth token',
      );
      return;
    }

    // 3. Connect to provider
    const connectResult = await terraService.connect(
      provider,
      tokenResult.token,
    );
    if (!connectResult.success) {
      setIsConnecting(false);
      Alert.alert(
        'Error',
        connectResult.error || 'Failed to connect to health provider',
      );
      return;
    }

    // 4. Get Terra user ID
    const userIdResult = await terraService.getTerraUserId(provider);

    // 5. Save connection to Supabase
    const saveResult = await wearableDataService.saveConnection({
      user_id: user.id,
      provider,
      terra_user_id: userIdResult.userId,
      is_active: true,
    });

    if (!saveResult.success) {
      setIsConnecting(false);
      Alert.alert(
        'Error',
        saveResult.error || 'Failed to save connection',
      );
      return;
    }

    setActiveConnection(saveResult.connection ?? null);

    // 6. Initial historical sync (fetch 90 days of history on first connect)
    console.log('WearableSetupScreen - Running initial historical sync');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    await wearableSyncService.syncAllData(user.id, provider, startDate, endDate);

    setIsConnecting(false);
    Alert.alert(
      'Connected',
      `${PROVIDER_LABELS[provider]} connected successfully.`,
    );
  };

  const handleSync = async () => {
    if (!user?.id || !activeConnection) {
      return;
    }

    setIsSyncing(true);
    console.log('WearableSetupScreen - Manual sync triggered');
    const result = await wearableSyncService.syncToday(
      user.id,
      activeConnection.provider,
    );
    setIsSyncing(false);

    if (result.success) {
      await loadConnectionStatus();
      Alert.alert('Synced', `${result.count ?? 0} data points updated.`);
    } else {
      Alert.alert('Sync Failed', result.error || 'Unable to sync data');
    }
  };

  const handleDisconnect = async () => {
    if (!user?.id || !activeConnection) {
      return;
    }

    Alert.alert(
      'Disconnect',
      `Disconnect ${PROVIDER_LABELS[activeConnection.provider]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            console.log('WearableSetupScreen - Disconnecting');
            const result = await wearableDataService.disconnectProvider(
              user.id,
              activeConnection.provider,
            );
            if (result.success) {
              setActiveConnection(null);
            } else {
              Alert.alert(
                'Error',
                result.error || 'Failed to disconnect',
              );
            }
          },
        },
      ],
    );
  };

  const formatLastSync = (timestamp: string | null): string => {
    if (!timestamp) {
      return 'Never';
    }
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { paddingTop: insets.top },
        ]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={colors.offWhite} />
        </TouchableOpacity>
        <Text style={styles.title}>WEARABLE</Text>
      </View>

      {activeConnection ? (
        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Connected</Text>
            </View>
            <Text style={styles.providerName}>
              {PROVIDER_LABELS[activeConnection.provider]}
            </Text>
            {activeConnection.device_names &&
              activeConnection.device_names.length > 0 && (
                <Text style={styles.deviceNames}>
                  {activeConnection.device_names.join(', ')}
                </Text>
              )}
            <Text style={styles.lastSync}>
              Last synced: {formatLastSync(activeConnection.last_sync_at)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={isSyncing}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.darkBrown} />
            ) : (
              <Text style={styles.syncButtonText}>SYNC NOW</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}>
            <Text style={styles.disconnectButtonText}>DISCONNECT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Connect your health data to optimize your training.
          </Text>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => handleConnect(defaultProvider)}
            disabled={isConnecting}>
            {isConnecting ? (
              <ActivityIndicator size="small" color={colors.darkBrown} />
            ) : (
              <>
                <Icon
                  name={
                    Platform.OS === 'ios' ? 'favorite' : 'monitor-heart'
                  }
                  size={20}
                  color={colors.darkBrown}
                />
                <Text style={styles.connectButtonText}>
                  CONNECT {PROVIDER_LABELS[defaultProvider].toUpperCase()}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={[styles.connectButton, styles.secondaryButton]}
              onPress={() => handleConnect('SAMSUNG')}
              disabled={isConnecting}>
              <Text style={styles.secondaryButtonText}>
                CONNECT SAMSUNG HEALTH
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.offWhite,
  },
  content: {
    paddingHorizontal: 24,
    flex: 1,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: colors.offWhite,
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 22,
  },
  statusCard: {
    borderWidth: 0.5,
    borderColor: colors.offWhite,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusLabel: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#4CAF50',
  },
  providerName: {
    fontFamily: 'Bebas Neue',
    fontSize: 24,
    color: colors.offWhite,
    marginBottom: 4,
  },
  deviceNames: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
    marginBottom: 8,
  },
  lastSync: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.gray.muted,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellow,
    paddingVertical: 16,
    borderRadius: 10,
    gap: 10,
    marginBottom: 16,
  },
  connectButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.darkBrown,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.offWhite,
  },
  secondaryButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
  },
  syncButton: {
    backgroundColor: colors.yellow,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  syncButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.darkBrown,
  },
  disconnectButton: {
    borderWidth: 1,
    borderColor: colors.gray.muted,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.gray.muted,
  },
});
