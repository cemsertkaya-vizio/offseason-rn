import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
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

type RegisterTrainEventCurrentStatusScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterTrainEventCurrentStatus'
>;

type RegisterTrainEventCurrentStatusScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterTrainEventCurrentStatus'
>;

interface RegisterTrainEventCurrentStatusScreenProps {
  navigation: RegisterTrainEventCurrentStatusScreenNavigationProp;
  route: RegisterTrainEventCurrentStatusScreenRouteProp;
}

export const RegisterTrainEventCurrentStatusScreen: React.FC<RegisterTrainEventCurrentStatusScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventType, eventMonth, eventYear } = route.params;
  const { user } = useAuth();
  const { updateRegistrationData, registrationData } = useRegistration();
  const [trainingDescription, setTrainingDescription] = useState('');
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
          const savedDescription = result.profile.onboarding_data.train_event_current_status as string;
          if (savedDescription) {
            console.log('RegisterTrainEventCurrentStatusScreen - Loading saved description');
            setTrainingDescription(savedDescription);
          }
        }
      } catch (error) {
        console.log('RegisterTrainEventCurrentStatusScreen - Error loading existing data:', error);
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

    console.log('RegisterTrainEventCurrentStatusScreen - Event type:', eventType);
    console.log('RegisterTrainEventCurrentStatusScreen - Event date:', eventMonth, eventYear);
    console.log('RegisterTrainEventCurrentStatusScreen - Training description:', trainingDescription);

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const goalData: GoalData = {
      type: 'train-event',
      eventType: eventType,
      eventMonth: eventMonth,
      eventYear: eventYear,
      trainingStatus: 'in-progress',
      currentStatus: trainingDescription.trim() || undefined,
    };

    const currentGoals = (registrationData.goals || []) as GoalData[];
    const updatedGoals = currentGoals.filter(g => g.type !== 'train-event');
    updatedGoals.push(goalData);

    updateRegistrationData({ goals: updatedGoals });

    const updatedData = {
      ...existingData,
      train_event_current_status: trainingDescription.trim() || null,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'train_event_details_completed',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('RegisterTrainEventCurrentStatusScreen - Error saving details:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterTrainEventCurrentStatusScreen - Details saved successfully');

    await goalNavigationService.markGoalCompleted(user.id, 'train-event');

    const { screen } = await goalNavigationService.getNextGoalScreen(user.id);

    setIsSaving(false);

    if (screen) {
      console.log('RegisterTrainEventCurrentStatusScreen - Navigating to next goal screen:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RegisterTrainEventCurrentStatusScreen - All goals completed, navigating to summary');
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
          Describe where you're at in your training.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={trainingDescription}
            onChangeText={setTrainingDescription}
            placeholder="Tell us more..."
            placeholderTextColor="#8e8a89"
            multiline
            textAlignVertical="top"
          />
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
    marginBottom: 35,
    width: '100%',
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    width: '100%',
  },
});

