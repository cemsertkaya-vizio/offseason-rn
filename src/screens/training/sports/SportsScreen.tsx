import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';

const { width: screenWidth } = Dimensions.get('window');

type SportsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Sports'
>;

interface SportsScreenProps {
  navigation: SportsScreenNavigationProp;
}

export const SportsScreen: React.FC<SportsScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [sportsText, setSportsText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('SportsScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile?.onboarding_data?.sports?.sport_types) {
        console.log('SportsScreen - Pre-filling with saved sport types');
        setSportsText(result.profile.onboarding_data.sports.sport_types);
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

    if (!sportsText.trim()) {
      Alert.alert('Required', 'Please enter at least one sport');
      return;
    }

    setIsSaving(true);
    console.log('SportsScreen - Saving progress with sports:', sportsText);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      sports: {
        ...existingData.sports,
        sport_types: sportsText.trim(),
      },
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'sports_types',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('SportsScreen - Error saving progress:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(false);
    console.log('SportsScreen - Progress saved, navigating to SportsType');
    navigation.navigate('SportsType');
  };

  const isNextDisabled = !sportsText.trim() || isSaving;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>SPORTS</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.question}>
          What sport(s) do you play?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type here..."
            placeholderTextColor={colors.gray.muted}
            value={sportsText}
            onChangeText={setSportsText}
            multiline
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
    paddingTop: 200,
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
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    marginBottom: 20,
    paddingHorizontal: 42,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: screenWidth - 70,
    paddingHorizontal: 5,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 21,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
});

