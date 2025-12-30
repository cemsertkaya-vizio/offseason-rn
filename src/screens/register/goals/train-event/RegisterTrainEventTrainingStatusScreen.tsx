import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { colors } from '../../../../constants/colors';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRegistration } from '../../../../contexts/RegistrationContext';
import { profileService } from '../../../../services/profileService';
import { goalNavigationService } from '../../../../services/goalNavigationService';
import type { GoalData } from '../../../../types/auth';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterTrainEventTrainingStatusScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterTrainEventTrainingStatus'
>;

type RegisterTrainEventTrainingStatusScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterTrainEventTrainingStatus'
>;

interface RegisterTrainEventTrainingStatusScreenProps {
  navigation: RegisterTrainEventTrainingStatusScreenNavigationProp;
  route: RegisterTrainEventTrainingStatusScreenRouteProp;
}

export const RegisterTrainEventTrainingStatusScreen: React.FC<RegisterTrainEventTrainingStatusScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventType, eventMonth, eventYear } = route.params;
  const { user } = useAuth();
  const { updateRegistrationData, registrationData } = useRegistration();
  const [hasStartedTraining, setHasStartedTraining] = useState<boolean | null>(null);
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
          const savedStatus = result.profile.onboarding_data.train_event_has_started as boolean;
          if (savedStatus !== undefined) {
            console.log('RegisterTrainEventTrainingStatusScreen - Loading saved status:', savedStatus);
            setHasStartedTraining(savedStatus);
          }
        }
      } catch (error) {
        console.log('RegisterTrainEventTrainingStatusScreen - Error loading existing data:', error);
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
    if (hasStartedTraining === null || !user) {
      if (!user) {
        Alert.alert('Error', 'Please log in to continue');
      }
      return;
    }

    console.log('RegisterTrainEventTrainingStatusScreen - Event type:', eventType);
    console.log('RegisterTrainEventTrainingStatusScreen - Event date:', eventMonth, eventYear);
    console.log('RegisterTrainEventTrainingStatusScreen - Has started training:', hasStartedTraining);

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      train_event_has_started: hasStartedTraining,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'train_event_training_status_selected',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('RegisterTrainEventTrainingStatusScreen - Error saving status:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterTrainEventTrainingStatusScreen - Status saved successfully');

    if (hasStartedTraining) {
      setIsSaving(false);
      navigation.navigate('RegisterTrainEventCurrentStatus', {
        eventType,
        eventMonth,
        eventYear,
      });
    } else {
      const goalData: GoalData = {
        type: 'train-event',
        eventType: eventType,
        eventMonth: eventMonth,
        eventYear: eventYear,
        trainingStatus: 'not-started',
      };

      const currentGoals = (registrationData.goals || []) as GoalData[];
      const updatedGoals = currentGoals.filter(g => g.type !== 'train-event');
      updatedGoals.push(goalData);

      updateRegistrationData({ goals: updatedGoals });

      await goalNavigationService.markGoalCompleted(user.id, 'train-event');

      const { screen } = await goalNavigationService.getNextGoalScreen(user.id);

      setIsSaving(false);

      if (screen) {
        console.log('RegisterTrainEventTrainingStatusScreen - Navigating to next goal screen:', screen);
        navigation.navigate(screen as any);
      } else {
        console.log('RegisterTrainEventTrainingStatusScreen - All goals completed, navigating to summary');
        navigation.navigate('RegisterSummaryReview');
      }
    }
  };

  const handleOptionSelect = (started: boolean) => {
    setHasStartedTraining(started);
  };

  const isNextDisabled = hasStartedTraining === null || isSaving;

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
          source={require('../../../../assets/coach-athlete.png')}
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
        <Text style={styles.title}>TRAIN FOR AN EVENT</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          Have you started training already?
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              hasStartedTraining === true && styles.optionButtonSelected,
            ]}
            onPress={() => handleOptionSelect(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              hasStartedTraining === false && styles.optionButtonSelected,
            ]}
            onPress={() => handleOptionSelect(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={isNextDisabled}
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
    marginBottom: 45,
    width: '100%',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
    width: '100%',
  },
  optionButtonSelected: {
    backgroundColor: colors.beige,
  },
  optionText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
});

