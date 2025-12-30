import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { navigationService } from '../services/navigationService';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../constants/colors';

type AppLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AppLoading'
>;

interface AppLoadingScreenProps {
  navigation: AppLoadingScreenNavigationProp;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ navigation }) => {
  const { user, isLoading } = useAuth();
  const hasNavigated = useRef(false);

  console.log('AppLoadingScreen - Render, user:', user?.id, 'isLoading:', isLoading);

  useEffect(() => {
    const determineRoute = async () => {
      console.log('AppLoadingScreen - Effect triggered');
      console.log('AppLoadingScreen - Auth loading:', isLoading);
      console.log('AppLoadingScreen - User:', user?.id);
      console.log('AppLoadingScreen - Has navigated:', hasNavigated.current);

      if (isLoading) {
        console.log('AppLoadingScreen - Still loading auth, waiting...');
        return;
      }

      if (hasNavigated.current) {
        console.log('AppLoadingScreen - Already navigated, skipping');
        return;
      }

      console.log('AppLoadingScreen - Starting route determination');
      let profile = null;

      if (user) {
        console.log('AppLoadingScreen - User authenticated, fetching profile...');
        const result = await profileService.getOnboardingStatus(user.id);
        
        if (result.success) {
          profile = result.profile;
          console.log('AppLoadingScreen - Profile fetched, step:', profile?.onboarding_step);
        } else {
          console.log('AppLoadingScreen - Error fetching profile:', result.error);
        }
      }

      const initialRoute = navigationService.determineInitialRoute(user, profile);
      console.log('AppLoadingScreen - Navigating to:', initialRoute);

      hasNavigated.current = true;
      navigation.replace(initialRoute as any);
    };

    determineRoute();
  }, [user, isLoading, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.offWhite} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

