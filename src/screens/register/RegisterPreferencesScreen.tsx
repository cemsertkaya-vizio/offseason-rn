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
import { RootStackParamList } from '../../types/navigation';
import { NavigationArrows } from '../../components/NavigationArrows';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterPreferencesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterPreferences'
>;

interface RegisterPreferencesScreenProps {
  navigation: RegisterPreferencesScreenNavigationProp;
}

const ACTIVITY_OPTIONS = [
  { id: 'weightlifting', label: 'Weightlifting' },
  { id: 'running', label: 'Running' },
  { id: 'swimming', label: 'Swimming' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'pilates', label: 'Pilates' },
  { id: 'sports', label: 'Sports' },
  { id: 'walking', label: 'Walking/Hiking' },
  { id: 'other', label: 'Other' },
];

export const RegisterPreferencesScreen: React.FC<RegisterPreferencesScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('RegisterPreferencesScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile && result.profile.selected_activities) {
        console.log('RegisterPreferencesScreen - Pre-filling with saved activities');
        const savedLabels = result.profile.selected_activities;
        const savedIds = ACTIVITY_OPTIONS
          .filter((opt) => savedLabels.includes(opt.label))
          .map((opt) => opt.id);
        setSelectedActivities(savedIds);
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

    const selectedLabels = ACTIVITY_OPTIONS
      .filter((opt) => selectedActivities.includes(opt.id))
      .map((opt) => opt.label);

    setIsSaving(true);
    console.log('RegisterPreferencesScreen - Saving progress');

    const result = await profileService.updateOnboardingProgress(
      user.id,
      'preferences',
      { selected_activities: selectedLabels }
    );

    setIsSaving(false);

    if (result.success) {
      console.log('RegisterPreferencesScreen - Progress saved, navigating to schedule');
      navigation.navigate('RegisterSchedule', { activities: selectedLabels });
    } else {
      console.log('RegisterPreferencesScreen - Error saving progress:', result.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const MAX_SELECTIONS = 4;

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      }
      if (prev.length >= MAX_SELECTIONS) {
        return prev;
      }
      return [...prev, activityId];
    });
  };

  const isNextDisabled = selectedActivities.length === 0 || isSaving;

  const leftColumn = ACTIVITY_OPTIONS.filter((_, index) => index % 2 === 0);
  const rightColumn = ACTIVITY_OPTIONS.filter((_, index) => index % 2 === 1);

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
          source={require('../../assets/coach-preferences.png')}
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
        <Text style={styles.title}>WHAT DO YOU LOVE DOING?</Text>
        <Text style={styles.subtitle}>
          The fastest way forward is knowing your baseline.
        </Text>

        <View style={styles.optionsContainer}>
          <View style={styles.column}>
            {leftColumn.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.optionButton,
                  selectedActivities.includes(activity.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleActivity(activity.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedActivities.includes(activity.id) && styles.optionTextSelected,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.optionButton,
                  selectedActivities.includes(activity.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleActivity(activity.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedActivities.includes(activity.id) && styles.optionTextSelected,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
});

