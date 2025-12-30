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

type RegisterLoseBodyFatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterLoseBodyFat'
>;

interface RegisterLoseBodyFatScreenProps {
  navigation: RegisterLoseBodyFatScreenNavigationProp;
}

const BODY_FAT_OPTIONS = Array.from({ length: 41 }, (_, i) => i + 10);

export const RegisterLoseBodyFatScreen: React.FC<RegisterLoseBodyFatScreenProps> = ({
  navigation,
}) => {
  const { updateRegistrationData, registrationData } = useRegistration();
  const { user } = useAuth();
  const [bodyFat, setBodyFat] = useState(20);
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
          const savedBodyFat = result.profile.onboarding_data.lose_body_fat_current as number;
          const savedDontKnow = result.profile.onboarding_data.lose_body_fat_dont_know as boolean;
          if (savedBodyFat) {
            console.log('RegisterLoseBodyFatScreen - Loading saved body fat:', savedBodyFat);
            setBodyFat(savedBodyFat);
          }
          if (savedDontKnow !== undefined) {
            setDontKnow(savedDontKnow);
          }
        }
      } catch (error) {
        console.log('RegisterLoseBodyFatScreen - Error loading existing data:', error);
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
      console.log('RegisterLoseBodyFatScreen - User does not know body fat %');
    } else {
      console.log('RegisterLoseBodyFatScreen - Current body fat:', bodyFat, '%');
    }

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      lose_body_fat_current: dontKnow ? null : bodyFat,
      lose_body_fat_dont_know: dontKnow,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'lose_body_fat_current_selected',
      { onboarding_data: updatedData }
    );

    setIsSaving(false);

    if (!saveResult.success) {
      console.log('RegisterLoseBodyFatScreen - Error saving body fat:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterLoseBodyFatScreen - Body fat saved successfully');
    navigation.navigate('RegisterLoseBodyFatDetails');
  };

  const handleDontKnow = () => {
    setDontKnow(true);
  };

  const handlePickerChange = (value: number) => {
    setBodyFat(value);
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
          source={require('../../../../assets/coach-lose-body-fat.png')}
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
        <Text style={styles.title}>LOSE BODY FAT</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          What's your current body fat %?
        </Text>

        <View style={styles.pickerContainer}>
          <ScrollPicker
            value={bodyFat}
            onChange={handlePickerChange}
            options={BODY_FAT_OPTIONS}
            unit="%"
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

