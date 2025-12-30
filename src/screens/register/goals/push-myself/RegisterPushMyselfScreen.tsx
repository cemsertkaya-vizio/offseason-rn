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
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { colors } from '../../../../constants/colors';
import { useRegistration } from '../../../../contexts/RegistrationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { profileService } from '../../../../services/profileService';
import { goalNavigationService } from '../../../../services/goalNavigationService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterPushMyselfScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterPushMyself'
>;

interface RegisterPushMyselfScreenProps {
  navigation: RegisterPushMyselfScreenNavigationProp;
}

const PUSH_OPTIONS = [
  { id: 'consistency', label: 'Better consistency' },
  { id: 'motivation', label: 'More motivation' },
  { id: 'effort', label: 'More effort' },
];

export const RegisterPushMyselfScreen: React.FC<RegisterPushMyselfScreenProps> = ({
  navigation,
}) => {
  const { updateRegistrationData, registrationData } = useRegistration();
  const { user } = useAuth();
  const [selectedPush, setSelectedPush] = useState<string | null>(null);
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
          const savedPushType = result.profile.onboarding_data.push_myself_type as string;
          if (savedPushType) {
            console.log('RegisterPushMyselfScreen - Loading saved push type:', savedPushType);
            setSelectedPush(savedPushType);
          }
        }
      } catch (error) {
        console.log('RegisterPushMyselfScreen - Error loading existing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  const handleNext = async () => {
    if (!selectedPush) {
      Alert.alert('Selection Required', 'Please select how you want to push yourself.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    console.log('RegisterPushMyselfScreen - Selected push type:', selectedPush);

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      push_myself_type: selectedPush,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'push_myself_selected',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('RegisterPushMyselfScreen - Error saving push type:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterPushMyselfScreen - Push type saved successfully');

    await goalNavigationService.markGoalCompleted(user.id, 'push-myself');

    const { screen } = await goalNavigationService.getNextGoalScreen(user.id);

    setIsSaving(false);

    if (screen) {
      console.log('RegisterPushMyselfScreen - Navigating to next goal screen:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('RegisterPushMyselfScreen - All goals completed, navigating to summary');
      navigation.navigate('RegisterSummaryReview');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-push-myself.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', colors.darkBrown]}
          locations={[0, 0.9454]}
          style={styles.gradient}
        />
      </View>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>PUSH MYSELF</Text>
          <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

          <Text style={styles.question}>How do you want to push yourself more?</Text>

          <View style={styles.optionsContainer}>
            {PUSH_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  selectedPush === option.id && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedPush(option.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedPush === option.id && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={!selectedPush || isSaving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.darkBrown,
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
    marginBottom: 52,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginBottom: 19,
    width: '100%',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 30,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 318,
  },
  optionButtonSelected: {
    backgroundColor: colors.offWhite,
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

