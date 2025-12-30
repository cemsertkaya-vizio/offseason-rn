import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
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
        const profile = await profileService.getProfile(user.id);
        if (profile?.goal_data) {
          const goalData = profile.goal_data as any;
          if (goalData.pushType) {
            setSelectedPush(goalData.pushType);
          }
        }
      } catch (error) {
        console.error('RegisterPushMyselfScreen - Failed to load existing data:', error);
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
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    setIsSaving(true);

    const goalData = {
      pushType: selectedPush,
    };

    updateRegistrationData({ goal_data: goalData });

    const saveResult = await profileService.updateProfile(user.id, {
      goal_data: goalData,
    });

    if (!saveResult) {
      setIsSaving(false);
      console.log('RegisterPushMyselfScreen - Error saving data');
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterPushMyselfScreen - Data saved successfully');

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
          colors={['rgba(0, 0, 0, 0.1)', colors.background]}
          locations={[0, 0.9454]}
          style={styles.gradient}
        />
      </View>

      <Text style={styles.title}>PUSH MYSELF</Text>
      <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

      <View style={styles.contentContainer}>
        <Text style={styles.questionText}>How do you want to push yourself more?</Text>

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
      </View>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={!selectedPush || isSaving}
        isLoading={isSaving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  title: {
    fontFamily: 'BebasNeue-Regular',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginTop: 11,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 42,
    paddingTop: 52,
  },
  questionText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginBottom: 19,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 30,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.offWhite,
  },
  optionText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.background,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.background,
  },
});

