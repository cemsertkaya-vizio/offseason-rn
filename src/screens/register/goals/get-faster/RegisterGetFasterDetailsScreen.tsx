import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { ScrollPicker } from '../../../../components/ScrollPicker';
import { colors } from '../../../../constants/colors';
import { useRegistration } from '../../../../contexts/RegistrationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { profileService } from '../../../../services/profileService';
import { goalNavigationService } from '../../../../services/goalNavigationService';
import type { GoalData } from '../../../../types/auth';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGetFasterDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGetFasterDetails'
>;

type RegisterGetFasterDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterGetFasterDetails'
>;

interface RegisterGetFasterDetailsScreenProps {
  navigation: RegisterGetFasterDetailsScreenNavigationProp;
  route: RegisterGetFasterDetailsScreenRouteProp;
}

type DistanceUnit = 'mile' | 'km' | 'meter';

const MINUTES_OPTIONS = Array.from({ length: 20 }, (_, i) => i);
const SECONDS_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const DISTANCE_UNITS: DistanceUnit[] = ['km', 'mile', 'meter'];

export const RegisterGetFasterDetailsScreen: React.FC<RegisterGetFasterDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { goalType } = route.params;
  const { updateRegistrationData, registrationData } = useRegistration();
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(7);
  const [seconds, setSeconds] = useState(30);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await profileService.getOnboardingStatus(user.id);
        if (result.success && result.profile?.onboarding_data) {
          const savedPace = result.profile.onboarding_data.get_faster_target_pace as any;
          if (savedPace) {
            console.log('RegisterGetFasterDetailsScreen - Loading saved pace:', savedPace);
            setMinutes(savedPace.minutes || 7);
            setSeconds(savedPace.seconds || 30);
            setDistanceUnit(savedPace.unit || 'mile');
          }
        }
      } catch (error) {
        console.log('RegisterGetFasterDetailsScreen - Error loading existing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    console.log('RegisterGetFasterDetailsScreen - Goal type:', goalType);
    console.log('RegisterGetFasterDetailsScreen - Target pace:', {
      minutes,
      seconds,
      unit: distanceUnit,
    });

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const goalData: GoalData = {
      type: 'get-faster',
      goalType: goalType,
      targetPace: {
        minutes,
        seconds,
        unit: distanceUnit,
      },
    };

    const currentGoals = (registrationData.goals || []) as GoalData[];
    const updatedGoals = currentGoals.filter(g => g.type !== 'get-faster');
    updatedGoals.push(goalData);

    updateRegistrationData({ goals: updatedGoals });

    const updatedData = {
      ...existingData,
      get_faster_target_pace: {
        minutes,
        seconds,
        unit: distanceUnit,
      },
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'get_faster_details_completed',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('RegisterGetFasterDetailsScreen - Error saving details:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterGetFasterDetailsScreen - Details saved successfully');

    await goalNavigationService.markGoalCompleted(user.id, 'get-faster');

    const { screen } = await goalNavigationService.getNextGoalScreen(user.id);

    setIsSaving(false);

    if (screen) {
      console.log('RegisterGetFasterDetailsScreen - Navigating to next goal screen:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RegisterGetFasterDetailsScreen - All goals completed, navigating to summary');
      navigation.navigate('RegisterSummaryReview');
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
          source={require('../../../../assets/coach-get-faster.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', colors.darkBrown]}
          locations={[0, 0.9454]}
          style={styles.gradient}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>GET FASTER</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          What's your target pace?
        </Text>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <ScrollPicker
              value={minutes}
              onChange={setMinutes}
              options={MINUTES_OPTIONS}
              unit="min"
              width={50}
            />
            <Text style={styles.separator}>/</Text>
            <ScrollPicker
              value={seconds}
              onChange={setSeconds}
              options={SECONDS_OPTIONS}
              unit="sec"
              width={50}
            />
            <Text style={styles.separator}>/</Text>
            <ScrollPicker
              value={distanceUnit}
              onChange={setDistanceUnit}
              options={DISTANCE_UNITS}
              width={74}
            />
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 130,
    paddingHorizontal: 42,
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
    marginBottom: 25,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginBottom: 29,
    width: '100%',
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  separator: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '400',
    color: colors.white,
    marginHorizontal: 4,
  },
});

