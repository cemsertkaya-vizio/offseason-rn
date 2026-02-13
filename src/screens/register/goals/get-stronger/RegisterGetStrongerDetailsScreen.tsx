import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { colors } from '../../../../constants/colors';
import { useRegistration } from '../../../../contexts/RegistrationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { profileService } from '../../../../services/profileService';
import { goalNavigationService } from '../../../../services/goalNavigationService';
import type { GoalData } from '../../../../types/auth';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGetStrongerDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGetStrongerDetails'
>;

interface RegisterGetStrongerDetailsScreenProps {
  navigation: RegisterGetStrongerDetailsScreenNavigationProp;
}

export const RegisterGetStrongerDetailsScreen: React.FC<RegisterGetStrongerDetailsScreenProps> = ({
  navigation,
}) => {
  const { updateRegistrationData, registrationData } = useRegistration();
  const { user } = useAuth();
  const [specificGoal, setSpecificGoal] = useState('');
  const [skipGoal, setSkipGoal] = useState(false);
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
          const savedGoalDetails = result.profile.onboarding_data.get_stronger_details as string;
          const savedSkipGoal = result.profile.onboarding_data.get_stronger_skip_details as boolean;
          if (savedGoalDetails) {
            console.log('RegisterGetStrongerDetailsScreen - Loading saved goal details:', savedGoalDetails);
            setSpecificGoal(savedGoalDetails);
          }
          if (savedSkipGoal !== undefined) {
            setSkipGoal(savedSkipGoal);
          }
        }
      } catch (error) {
        console.log('RegisterGetStrongerDetailsScreen - Error loading existing data:', error);
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

    if (skipGoal) {
      console.log('RegisterGetStrongerDetailsScreen - User chose to skip specific goal');
    } else {
      console.log('RegisterGetStrongerDetailsScreen - Specific goal:', specificGoal);
    }

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};
    const muscleGroups = existingData.get_stronger_muscle_groups as string[] || [];

    const goalData: GoalData = {
      type: 'get-stronger',
      muscleGroups: muscleGroups,
      details: skipGoal ? undefined : specificGoal.trim(),
    };

    const currentGoals = (registrationData.goals || []) as GoalData[];
    const updatedGoals = currentGoals.filter(g => g.type !== 'get-stronger');
    updatedGoals.push(goalData);

    updateRegistrationData({ goals: updatedGoals });

    const updatedData = {
      ...existingData,
      get_stronger_details: skipGoal ? null : specificGoal.trim(),
      get_stronger_skip_details: skipGoal,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'get_stronger_details_completed',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('RegisterGetStrongerDetailsScreen - Error saving details:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterGetStrongerDetailsScreen - Details saved successfully');

    await goalNavigationService.markGoalCompleted(user.id, 'get-stronger');

    const { screen } = await goalNavigationService.getNextGoalScreen(user.id);

    setIsSaving(false);

    if (screen) {
      console.log('RegisterGetStrongerDetailsScreen - Navigating to next goal screen:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RegisterGetStrongerDetailsScreen - All goals completed, navigating to AnythingElse');
      navigation.navigate('AnythingElse');
    }
  };

  const handleSkipGoal = () => {
    setSkipGoal(true);
    setSpecificGoal('');
  };

  const handleTextInputFocus = () => {
    if (skipGoal) {
      setSkipGoal(false);
    }
  };

  const isNextDisabled = (!skipGoal && specificGoal.trim().length === 0) || isSaving;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-get-stronger.png')}
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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>GET STRONGER</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          Do you have any specific strength goals you are targeting (e.g. bench 225 lbs)?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              skipGoal && styles.textInputDisabled,
            ]}
            placeholder="Tell us more..."
            placeholderTextColor={colors.gray.muted}
            value={specificGoal}
            onChangeText={setSpecificGoal}
            onFocus={handleTextInputFocus}
            multiline
            editable={!skipGoal}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.skipButton,
            skipGoal && styles.skipButtonActive,
          ]}
          onPress={handleSkipGoal}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>
            No, I just want to feel stronger
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={isNextDisabled}
      />
    </KeyboardAvoidingView>
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
    marginBottom: 20,
    width: '100%',
    maxWidth: 312,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 332,
    marginBottom: 102,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  skipButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
    width: '100%',
    maxWidth: 318,
  },
  skipButtonActive: {
    backgroundColor: colors.beige,
  },
  skipButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
});

