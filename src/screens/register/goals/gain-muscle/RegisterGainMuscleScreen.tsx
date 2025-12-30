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
import { ScrollPicker } from '../../../../components/ScrollPicker';
import { colors } from '../../../../constants/colors';
import { useRegistration } from '../../../../contexts/RegistrationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { profileService } from '../../../../services/profileService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGainMuscleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGainMuscle'
>;

interface RegisterGainMuscleScreenProps {
  navigation: RegisterGainMuscleScreenNavigationProp;
}

const MUSCLE_MASS_OPTIONS = Array.from({ length: 200 }, (_, i) => i + 1);

export const RegisterGainMuscleScreen: React.FC<RegisterGainMuscleScreenProps> = ({
  navigation,
}) => {
  const { updateRegistrationData, registrationData } = useRegistration();
  const { user } = useAuth();
  const [muscleMass, setMuscleMass] = useState(65);
  const [dontKnow, setDontKnow] = useState(false);
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
          const savedMuscleMass = result.profile.onboarding_data.gain_muscle_current_mass as number;
          const savedDontKnow = result.profile.onboarding_data.gain_muscle_dont_know as boolean;
          if (savedMuscleMass) {
            console.log('RegisterGainMuscleScreen - Loading saved muscle mass:', savedMuscleMass);
            setMuscleMass(savedMuscleMass);
          }
          if (savedDontKnow !== undefined) {
            setDontKnow(savedDontKnow);
          }
        }
      } catch (error) {
        console.log('RegisterGainMuscleScreen - Error loading existing data:', error);
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

    if (dontKnow) {
      console.log('RegisterGainMuscleScreen - User does not know muscle mass');
    } else {
      console.log('RegisterGainMuscleScreen - Current muscle mass:', muscleMass, 'lbs');
    }

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      gain_muscle_current_mass: dontKnow ? null : muscleMass,
      gain_muscle_dont_know: dontKnow,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'gain_muscle_current_mass_selected',
      { onboarding_data: updatedData }
    );

    setIsSaving(false);

    if (!saveResult.success) {
      console.log('RegisterGainMuscleScreen - Error saving muscle mass:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterGainMuscleScreen - Muscle mass saved successfully');
    navigation.navigate('RegisterGainMuscleDetails');
  };

  const handleDontKnow = () => {
    setDontKnow(true);
  };

  const handlePickerChange = (value: number) => {
    setMuscleMass(value);
    if (dontKnow) {
      setDontKnow(false);
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
          source={require('../../../../assets/coach-gain-muscle.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', colors.darkBrown]}
          locations={[0, 0.9454]}
          style={styles.gradient}
        />
      </View>

      <View style={[styles.content, styles.scrollContent]}>
        <Text style={styles.title}>GAIN MUSCLE MASS</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          How much muscle mass do you currently have?
        </Text>

        <View style={styles.pickerContainer}>
          <ScrollPicker
            value={muscleMass}
            onChange={handlePickerChange}
            options={MUSCLE_MASS_OPTIONS}
            unit="lbs"
            width={63}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.dontKnowButton,
            dontKnow && styles.dontKnowButtonActive,
          ]}
          onPress={handleDontKnow}
          activeOpacity={0.7}
        >
          <Text style={styles.dontKnowButtonText}>
            I don't know
          </Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 56,
  },
  dontKnowButton: {
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
  dontKnowButtonActive: {
    backgroundColor: colors.beige,
  },
  dontKnowButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
});

