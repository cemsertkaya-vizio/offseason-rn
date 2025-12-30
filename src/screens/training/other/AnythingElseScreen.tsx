import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type AnythingElseScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AnythingElse'
>;

interface AnythingElseScreenProps {
  navigation: AnythingElseScreenNavigationProp;
}

export const AnythingElseScreen: React.FC<AnythingElseScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('AnythingElseScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile?.onboarding_data?.anything_else) {
        console.log('AnythingElseScreen - Pre-filling with saved info');
        setAdditionalInfo(result.profile.onboarding_data.anything_else);
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
    console.log('AnythingElseScreen - Saving progress with info:', additionalInfo);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      anything_else: additionalInfo.trim() || null,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'anything_else_complete',
      { onboarding_data: updatedData }
    );

    setIsSaving(false);

    if (saveResult.success) {
      console.log('AnythingElseScreen - Progress saved, navigating to RegisterGoals');
      navigation.navigate('RegisterGoals');
    } else {
      console.log('AnythingElseScreen - Error saving progress:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
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
          source={require('../../../assets/coach-anything-else.png')}
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
        <Text style={styles.title}>ANYTHING ELSE?</Text>
        <Text style={styles.subtitle}>
          If there's anything we didn't cover, share it here.
        </Text>

        <Text style={styles.question}>
          Is there anything else you want to tell us about your routine & preferences?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tell us more..."
            placeholderTextColor={colors.gray.muted}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline={false}
          />
        </View>
      </ScrollView>

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
    marginBottom: 14,
    paddingHorizontal: 35,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 35,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: '400',
    color: colors.offWhite,
  },
});

