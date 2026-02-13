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
import { RootStackParamList } from '../../types/navigation';
import { NavigationArrows } from '../../components/NavigationArrows';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { activityNavigationService } from '../../services/activityNavigationService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

const WEEKDAYS = [
  { id: 'M', label: 'M' },
  { id: 'Tu', label: 'Tu' },
  { id: 'W', label: 'W' },
  { id: 'Th', label: 'Th' },
  { id: 'F', label: 'F' },
  { id: 'Sa', label: 'Sa' },
  { id: 'Su', label: 'Su' },
];

type RegisterPreferredDaysScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterPreferredDays'
>;

type RegisterPreferredDaysScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterPreferredDays'
>;

interface RegisterPreferredDaysScreenProps {
  navigation: RegisterPreferredDaysScreenNavigationProp;
  route: RegisterPreferredDaysScreenRouteProp;
}

type PreferredDaysState = Record<string, string[]>;

export const RegisterPreferredDaysScreen: React.FC<RegisterPreferredDaysScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<string[]>(route.params?.activities || []);
  const [preferredDays, setPreferredDays] = useState<PreferredDaysState>({});
  const [noPreference, setNoPreference] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('RegisterPreferredDaysScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile) {
        if (!route.params?.activities && result.profile.selected_activities) {
          console.log('RegisterPreferredDaysScreen - Loading activities from profile');
          setActivities(result.profile.selected_activities);
        }

        if (result.profile.preferred_days) {
          console.log('RegisterPreferredDaysScreen - Pre-filling with saved preferred days');
          setPreferredDays(result.profile.preferred_days as PreferredDaysState);
        } else if (activities.length > 0) {
          const initial: PreferredDaysState = {};
          activities.forEach((activity) => {
            initial[activity] = [];
          });
          setPreferredDays(initial);
        }
      } else if (activities.length > 0) {
        const initial: PreferredDaysState = {};
        activities.forEach((activity) => {
          initial[activity] = [];
        });
        setPreferredDays(initial);
      }

      setIsLoading(false);
    };

    loadSavedData();
  }, [user, activities.length, route.params?.activities]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    setIsSaving(true);
    console.log('RegisterPreferredDaysScreen - Saving progress with preferred days:', preferredDays);

    const profileResult = await profileService.getOnboardingStatus(user.id);
    const existingData = profileResult.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      _completed_activities: [],
    };

    const result = await profileService.updateOnboardingProgress(
      user.id,
      'preferred_days',
      { 
        preferred_days: preferredDays,
        onboarding_data: updatedData,
      }
    );

    if (!result.success) {
      setIsSaving(false);
      console.log('RegisterPreferredDaysScreen - Error saving progress:', result.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterPreferredDaysScreen - Progress saved, checking for next activity');

    const { screen } = await activityNavigationService.getNextActivityScreen(user.id);

    setIsSaving(false);

    if (screen) {
      console.log('RegisterPreferredDaysScreen - Navigating to activity:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RegisterPreferredDaysScreen - No activities with screens, navigating to RegisterGoals');
      navigation.navigate('RegisterGoals');
    }
  };

  const toggleDay = (activity: string, dayId: string) => {
    setNoPreference(false);
    setPreferredDays((prev) => {
      const currentDays = prev[activity] || [];
      if (currentDays.includes(dayId)) {
        return {
          ...prev,
          [activity]: currentDays.filter((d) => d !== dayId),
        };
      }
      return {
        ...prev,
        [activity]: [...currentDays, dayId],
      };
    });
  };

  const handleNoPreference = () => {
    setNoPreference(true);
    const cleared: PreferredDaysState = {};
    activities.forEach((activity) => {
      cleared[activity] = [];
    });
    setPreferredDays(cleared);
  };

  const hasAnySelection = Object.values(preferredDays).some((days) => days.length > 0);
  const isNextDisabled = !noPreference && !hasAnySelection || isSaving;

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
        <Text style={styles.title}>PREFERRED DAYS OF THE WEEK</Text>
        <Text style={styles.subtitle}>
          We'll use this to build your training week.
        </Text>

        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <View key={activity} style={styles.activityRow}>
              <Text style={styles.activityLabel}>{activity}</Text>
              <View style={styles.daysContainer}>
                {WEEKDAYS.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      preferredDays[activity]?.includes(day.id) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(activity, day.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        preferredDays[activity]?.includes(day.id) && styles.dayTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.noPreferenceButton,
            noPreference && styles.noPreferenceButtonSelected,
          ]}
          onPress={handleNoPreference}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.noPreferenceText,
              noPreference && styles.noPreferenceTextSelected,
            ]}
          >
            I have no preference
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 28,
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
  activitiesContainer: {
    gap: 28,
  },
  activityRow: {
    gap: 12,
  },
  activityLabel: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 9,
  },
  dayButton: {
    width: 42,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.beige,
  },
  dayText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
  },
  dayTextSelected: {
    color: colors.darkBrown,
  },
  noPreferenceButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginHorizontal: 14,
  },
  noPreferenceButtonSelected: {
    backgroundColor: colors.beige,
  },
  noPreferenceText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  noPreferenceTextSelected: {
    color: colors.darkBrown,
  },
});

