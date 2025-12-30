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
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { colors } from '../../../constants/colors';
import { useRegistration } from '../../../contexts/RegistrationContext';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';
import { goalNavigationService } from '../../../services/goalNavigationService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGoalsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGoals'
>;

interface RegisterGoalsScreenProps {
  navigation: RegisterGoalsScreenNavigationProp;
}

const GOAL_OPTIONS = [
  { id: 'get-stronger', label: 'Get stronger' },
  { id: 'get-faster', label: 'Get faster' },
  { id: 'gain-muscle', label: 'Gain muscle mass' },
  { id: 'lose-fat', label: 'Lose body fat' },
  { id: 'train-event', label: 'Train for an event' },
  { id: 'push-myself', label: 'Push myself' },
];

export const RegisterGoalsScreen: React.FC<RegisterGoalsScreenProps> = ({
  navigation,
}) => {
  const { updateRegistrationData, registrationData } = useRegistration();
  const { user } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
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
          const savedGoals = result.profile.onboarding_data.selected_goals as string[];
          if (savedGoals && savedGoals.length > 0) {
            console.log('RegisterGoalsScreen - Loading saved goals:', savedGoals);
            setSelectedGoals(savedGoals);
          }
        }
      } catch (error) {
        console.log('RegisterGoalsScreen - Error loading existing data:', error);
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

    console.log('RegisterGoalsScreen - Next pressed with goals:', selectedGoals);
    const selectedLabels = GOAL_OPTIONS
      .filter((opt) => selectedGoals.includes(opt.id))
      .map((opt) => opt.label);
    console.log('RegisterGoalsScreen - Selected goal labels:', selectedLabels);

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      selected_goals: selectedGoals,
      _completed_goals: [],
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'goals_selected',
      { onboarding_data: updatedData }
    );

    setIsSaving(false);

    if (!saveResult.success) {
      console.log('RegisterGoalsScreen - Error saving goals:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your goals. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterGoalsScreen - Goals saved successfully');

    const simpleGoals = await goalNavigationService.getSimpleGoals(user.id);
    const simpleGoalData = simpleGoals.map(goalId => ({ type: goalId }));

    updateRegistrationData({ 
      goals: [...simpleGoalData]
    });

    const { screen } = await goalNavigationService.getNextGoalScreen(user.id);

    if (screen) {
      console.log('RegisterGoalsScreen - Navigating to first goal screen:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RegisterGoalsScreen - No goals with screens, only simple goals. Navigating to summary');
      navigation.navigate('RegisterSummaryReview');
    }
  };

  const MAX_SELECTIONS = 2;

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId);
      }
      if (prev.length >= MAX_SELECTIONS) {
        return prev;
      }
      return [...prev, goalId];
    });
  };

  const isNextDisabled = selectedGoals.length !== MAX_SELECTIONS || isSaving;

  const leftColumn = GOAL_OPTIONS.filter((_, index) => index % 2 === 0);
  const rightColumn = GOAL_OPTIONS.filter((_, index) => index % 2 === 1);

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
          source={require('../../../assets/coach-athlete.png')}
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
        <Text style={styles.title}>HOW DO YOU WANT TO LEVEL UP?</Text>
        <Text style={styles.subtitle}>
          Define your top two goals.
        </Text>

        <View style={styles.optionsContainer}>
          <View style={styles.column}>
            {leftColumn.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.optionButton,
                  selectedGoals.includes(goal.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedGoals.includes(goal.id) && styles.optionTextSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.optionButton,
                  selectedGoals.includes(goal.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedGoals.includes(goal.id) && styles.optionTextSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {isSaving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" color={colors.offWhite} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 42,
  },
  column: {
    flex: 1,
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
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
  optionTextSelected: {
    color: colors.darkBrown,
  },
  savingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    marginLeft: 10,
  },
});

