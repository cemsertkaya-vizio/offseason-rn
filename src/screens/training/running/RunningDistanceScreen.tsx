import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { ScrollPicker } from '../../../components/ScrollPicker';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';
import { activityNavigationService } from '../../../services/activityNavigationService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RunningDistanceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RunningDistance'
>;

interface RunningDistanceScreenProps {
  navigation: RunningDistanceScreenNavigationProp;
}

const DISTANCE_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const UNIT_OPTIONS = ['minutes', 'km', 'miles'];

export const RunningDistanceScreen: React.FC<RunningDistanceScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [distance, setDistance] = useState(1);
  const [unit, setUnit] = useState('km');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('RunningDistanceScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile?.onboarding_data?.running?.distance) {
        console.log('RunningDistanceScreen - Pre-filling with saved distance');
        const distanceData = result.profile.onboarding_data.running.distance;
        setDistance(distanceData.value);
        setUnit(distanceData.unit);
      }

      setIsLoading(false);
    };

    loadSavedData();
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    const distanceData = { value: distance, unit };

    setIsSaving(true);
    console.log('RunningDistanceScreen - Saving progress with distance:', distanceData);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      running: {
        ...existingData.running,
        distance: distanceData,
      },
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'running_distance',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('RunningDistanceScreen - Error saving progress:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RunningDistanceScreen - Progress saved, marking activity as completed');

    const marked = await activityNavigationService.markActivityCompleted(user.id, 'Running');

    if (!marked) {
      setIsSaving(false);
      Alert.alert('Error', 'Could not complete activity. Please try again.', [{ text: 'OK' }]);
      return;
    }

    const { screen } = await activityNavigationService.getNextActivityScreen(user.id, 'Running');

    setIsSaving(false);

    if (screen) {
      console.log('RunningDistanceScreen - Navigating to next activity:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RunningDistanceScreen - All activities complete, navigating to AnythingElse');
      navigation.navigate('AnythingElse');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/coach-running.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', colors.darkBrown]}
          locations={[0, 0.9454]}
          style={styles.gradient}
        />
      </View>

      <View style={[styles.content, styles.scrollContent]}>
        <Text style={styles.title}>RUNNING</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.question}>
          How far or long do you run?
        </Text>

        <View style={styles.pickersRow}>
          <ScrollPicker
            value={distance}
            onChange={setDistance}
            options={DISTANCE_OPTIONS}
            width={50}
          />
          
          <View style={styles.spacer} />
          
          <ScrollPicker
            value={unit}
            onChange={setUnit}
            options={UNIT_OPTIONS}
            width={74}
          />
        </View>
      </View>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={isSaving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth,
    height: IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    marginTop: IMAGE_HEIGHT - 30,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 11,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 28,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    marginBottom: 35,
    paddingHorizontal: 42,
    alignSelf: 'flex-start',
  },
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 29,
  },
});

