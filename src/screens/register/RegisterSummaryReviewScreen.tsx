import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useRegistration } from '../../contexts/RegistrationContext';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { workoutService } from '../../services/workoutService';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

type RegisterSummaryReviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterSummaryReview'
>;

interface RegisterSummaryReviewScreenProps {
  navigation: RegisterSummaryReviewScreenNavigationProp;
}

export const RegisterSummaryReviewScreen: React.FC<RegisterSummaryReviewScreenProps> = ({
  navigation,
}) => {
  const { registrationData, updateRegistrationData, clearRegistrationData } = useRegistration();
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const [selectedButton, setSelectedButton] = useState<'approve' | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isBuildingWorkout, setIsBuildingWorkout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        console.log('RegisterSummaryReviewScreen - No user found');
        setIsLoading(false);
        return;
      }

      console.log('RegisterSummaryReviewScreen - Loading profile data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile) {
        const profile = result.profile;
        console.log('RegisterSummaryReviewScreen - Profile loaded successfully');

        const dataToUpdate: any = {};

        if (profile.first_name) dataToUpdate.firstName = profile.first_name;
        if (profile.last_name) dataToUpdate.lastName = profile.last_name;
        if (profile.phone_number) dataToUpdate.phoneNumber = profile.phone_number;
        if (profile.height_feet !== undefined && profile.height_inches !== undefined) {
          dataToUpdate.height = { feet: profile.height_feet, inches: profile.height_inches };
        }
        if (profile.weight_lbs) dataToUpdate.weight = profile.weight_lbs;
        if (profile.age) dataToUpdate.age = profile.age;
        if (profile.gender) dataToUpdate.gender = profile.gender;
        if (profile.location) dataToUpdate.location = profile.location;
        if (profile.selected_activities) dataToUpdate.activities = profile.selected_activities;
        if (profile.preferred_days) dataToUpdate.preferredDays = profile.preferred_days;
        if (profile.training_schedule) dataToUpdate.trainingSchedule = profile.training_schedule;

        if (profile.onboarding_data) {
          const onboardingData = profile.onboarding_data;
          if (onboardingData.selected_goals) {
            dataToUpdate.selectedGoals = onboardingData.selected_goals;
          }
        }

        if (registrationData.goals) {
          dataToUpdate.goals = registrationData.goals;
        }

        console.log('RegisterSummaryReviewScreen - Updating context with profile data');
        updateRegistrationData(dataToUpdate);
      } else {
        console.log('RegisterSummaryReviewScreen - Error loading profile:', result.error);
      }

      setIsLoading(false);
    };

    loadProfileData();
  }, [user]);

  const handleApprove = () => {
    setSelectedButton('approve');
    setIsApproved(true);
    updateRegistrationData({ profileSummary: summaryText });
  };

  const handleGetStarted = async () => {
    console.log('RegisterSummaryReviewScreen - Get Started pressed');
    
    if (!user) {
      Alert.alert('Error', 'You must be authenticated to complete registration. Please restart the registration process.');
      return;
    }

    setIsCreatingProfile(true);
    console.log('RegisterSummaryReviewScreen - Creating profile for user:', user.id);

    const result = await profileService.getOnboardingStatus(user.id);
    
    if (!result.success || !result.profile) {
      setIsCreatingProfile(false);
      Alert.alert('Error', 'Could not load profile data. Please try again.');
      return;
    }

    const profile = result.profile;
    
    if (!profile.first_name || !profile.phone_number) {
      setIsCreatingProfile(false);
      Alert.alert('Error', 'Registration data incomplete. Please go back and complete all steps.');
      return;
    }

    const profileResult = await profileService.createProfile(
      user.id,
      registrationData as any
    );

    if (!profileResult.success) {
      setIsCreatingProfile(false);
      console.log('RegisterSummaryReviewScreen - Error creating profile:', profileResult.error);
      Alert.alert(
        'Error',
        profileResult.error || 'Failed to create profile. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterSummaryReviewScreen - Profile created successfully, building workout season');
    setIsCreatingProfile(false);
    setIsBuildingWorkout(true);

    const buildResult = await workoutService.buildWorkoutSeason(user.id);

    setIsBuildingWorkout(false);

    if (buildResult.success) {
      console.log('RegisterSummaryReviewScreen - Workout season built successfully, registration complete');
      clearRegistrationData();
      navigation.replace('MainTabs');
    } else {
      console.log('RegisterSummaryReviewScreen - Error building workout season:', buildResult.error);
      Alert.alert(
        'Error',
        buildResult.error || 'Failed to build workout plan. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const summaryText = "Jodie Z is an ex-tennis player now training for a half-marathon in March. She loves running, hiking, yoga, and swimming.";

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>SUMMARY REVIEW</Text>

        <View style={styles.messageContainer}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              We loved getting to know you better!
            </Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              Before we move forward, let's make sure we've got everything right.
            </Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              Here's what we have for your summary. You can always edit later.
            </Text>
          </View>

          <View style={styles.messageRow}>
            <View style={styles.shadow} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{summaryText}</Text>
              <View style={styles.glowOverlay} />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedButton === 'approve' && styles.actionButtonSelected,
              ]}
              onPress={handleApprove}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>

          {isApproved && (
            <>
              <View style={styles.messageRow}>
                <View style={styles.shadow} />
                <View style={[styles.messageBubble, styles.messageBubbleInRow]}>
                  <Text style={styles.messageText}>
                    Thanks for confirming! We will now create your plan within the next 12 hours. Our Founder will reach out to you if we have any questions.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.getStartedButton,
                  isBuildingWorkout && styles.getStartedButtonExpanded,
                ]}
                onPress={handleGetStarted}
                activeOpacity={0.7}
                disabled={isCreatingProfile || isBuildingWorkout}
              >
                {isCreatingProfile || isBuildingWorkout ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.darkBrown} />
                    <View style={styles.loadingTextContainer}>
                      <Text style={styles.loadingText}>
                        {isBuildingWorkout ? 'Building your workout plan...' : 'Creating profile...'}
                      </Text>
                      {isBuildingWorkout && (
                        <Text style={styles.loadingSubText}>It can take up to 20 seconds</Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 95,
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 30,
  },
  messageContainer: {
    width: screenWidth,
    paddingHorizontal: 42,
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    width: '100%',
  },
  messageBubble: {
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 14,
    marginBottom: 14,
    maxWidth: screenWidth - 120,
    marginLeft: 36,
  },
  messageBubbleInRow: {
    marginBottom: 0,
    marginLeft: 0,
    flex: 1,
  },
  messageText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkBrown,
    lineHeight: 20,
  },
  summaryBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 14,
    maxWidth: screenWidth - 120,
    position: 'relative',
    flex: 1,
  },
  summaryText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.offWhite,
    lineHeight: 20,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    shadowColor: colors.offWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 0,
  },
  shadow: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: colors.offWhite,
    shadowColor: colors.offWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 10,
    marginRight: 7,
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    marginLeft: 36,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 8,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  actionButtonSelected: {
    backgroundColor: colors.beige,
  },
  actionButtonText: {
    fontFamily: 'Roboto',
    fontSize: 8,
    fontWeight: '500',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 28,
    paddingHorizontal: 60,
    paddingVertical: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: 304,
  },
  getStartedButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  getStartedButtonExpanded: {
    height: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingTextContainer: {
    alignItems: 'flex-start',
  },
  loadingText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkBrown,
  },
  loadingSubText: {
    fontFamily: 'Roboto',
    fontSize: 11,
    fontWeight: '400',
    color: colors.darkBrown,
    opacity: 0.7,
    marginTop: 2,
  },
});

