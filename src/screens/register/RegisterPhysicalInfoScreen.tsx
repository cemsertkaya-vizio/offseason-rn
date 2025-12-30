import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { NavigationArrows } from '../../components/NavigationArrows';
import { HeightPicker } from '../../components/HeightPicker';
import { WeightInput } from '../../components/WeightInput';
import { AgeInput } from '../../components/AgeInput';
import { GenderPicker } from '../../components/GenderPicker';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';

type RegisterPhysicalInfoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterPhysicalInfo'
>;

interface RegisterPhysicalInfoScreenProps {
  navigation: RegisterPhysicalInfoScreenNavigationProp;
}

export const RegisterPhysicalInfoScreen: React.FC<RegisterPhysicalInfoScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [height, setHeight] = useState<{ feet: number; inches: number } | null>(null);
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [ageIsValid, setAgeIsValid] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('RegisterPhysicalInfoScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile) {
        const profile = result.profile;
        console.log('RegisterPhysicalInfoScreen - Pre-filling with saved data');

        if (profile.height_feet && profile.height_inches !== undefined) {
          setHeight({ feet: profile.height_feet, inches: profile.height_inches });
        }
        if (profile.weight_lbs) {
          setWeight(profile.weight_lbs.toString());
        }
        if (profile.age) {
          setAge(profile.age.toString());
          setAgeIsValid(true);
        }
        if (profile.gender) {
          setGender(profile.gender);
        }
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

    setIsSaving(true);
    console.log('RegisterPhysicalInfoScreen - Saving progress');

    const result = await profileService.updateOnboardingProgress(
      user.id,
      'physical_info',
      {
        height_feet: height?.feet,
        height_inches: height?.inches,
        weight_lbs: parseFloat(weight),
        age: parseInt(age, 10),
        gender: gender || undefined,
      }
    );

    setIsSaving(false);

    if (result.success) {
      console.log('RegisterPhysicalInfoScreen - Progress saved, navigating to location');
      navigation.navigate('RegisterLocation');
    } else {
      console.log('RegisterPhysicalInfoScreen - Error saving progress:', result.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const isHeightValid = height !== null;
  const isWeightValid = weight.trim() !== '' && parseInt(weight, 10) > 0;
  const isAgeValid = age.trim() !== '' && ageIsValid;
  const isGenderValid = gender !== null && gender !== '';

  const isNextDisabled = !isHeightValid || !isWeightValid || !isAgeValid || !isGenderValid || isSaving;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach-background.png')}
      />

      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Let's get you in the game.</Text>

        <View style={styles.inputsWrapper}>
          <HeightPicker
            value={height}
            onChange={setHeight}
            style={styles.textField}
          />

          <WeightInput
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            style={styles.textField}
          />

          <AgeInput
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            onValidationChange={setAgeIsValid}
            style={styles.textField}
          />

          <GenderPicker
            value={gender}
            onChange={setGender}
            style={styles.textField}
          />
        </View>
      </KeyboardAwareScrollView>

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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 49,
    paddingTop: 19,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 40,
  },
  inputsWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  textField: {
    marginBottom: 0,
  },
});

