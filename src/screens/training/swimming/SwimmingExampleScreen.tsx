import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { ScrollPicker } from '../../../components/ScrollPicker';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';
import { activityNavigationService } from '../../../services/activityNavigationService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 270;

type SwimmingExampleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SwimmingExample'
>;

interface SwimmingExampleScreenProps {
  navigation: SwimmingExampleScreenNavigationProp;
}

const SETS_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];
const METERS_OPTIONS = [25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500];
const SECONDS_OPTIONS = [30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 210, 240];
const STROKE_OPTIONS = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Individual Medley'];

export const SwimmingExampleScreen: React.FC<SwimmingExampleScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [sets, setSets] = useState(8);
  const [meters, setMeters] = useState(100);
  const [seconds, setSeconds] = useState(90);
  const [stroke, setStroke] = useState('Freestyle');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('SwimmingExampleScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile?.onboarding_data?.swimming?.example) {
        console.log('SwimmingExampleScreen - Pre-filling with saved example');
        const example = result.profile.onboarding_data.swimming.example;
        setSets(example.sets);
        setMeters(example.meters);
        setSeconds(example.seconds);
        setStroke(example.stroke);
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

    const exampleData = { sets, meters, seconds, stroke };

    setIsSaving(true);
    console.log('SwimmingExampleScreen - Saving progress with example:', exampleData);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      swimming: {
        ...existingData.swimming,
        example: exampleData,
      },
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'swimming_example',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('SwimmingExampleScreen - Error saving progress:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('SwimmingExampleScreen - Progress saved, marking activity as completed');

    const marked = await activityNavigationService.markActivityCompleted(user.id, 'Swimming');

    if (!marked) {
      setIsSaving(false);
      Alert.alert('Error', 'Could not complete activity. Please try again.', [{ text: 'OK' }]);
      return;
    }

    const { screen } = await activityNavigationService.getNextActivityScreen(user.id, 'Swimming');

    setIsSaving(false);

    if (screen) {
      console.log('SwimmingExampleScreen - Navigating to next activity:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('SwimmingExampleScreen - All activities complete, navigating to AnythingElse');
      navigation.navigate('AnythingElse');
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
          source={require('../../../assets/coach-swimming.png')}
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
        <Text style={styles.title}>SWIMMING</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.description}>
          Give us an example of what a challenging but doable set looks like for you. For example, 8x100m freestyle; 90 seconds each.
        </Text>

        <View style={styles.pickersRow}>
          <ScrollPicker
            value={sets}
            onChange={setSets}
            options={SETS_OPTIONS}
            unit="sets"
            width={50}
          />
          
          <Text style={styles.multiplier}>x</Text>
          
          <ScrollPicker
            value={meters}
            onChange={setMeters}
            options={METERS_OPTIONS}
            unit="meters"
            width={50}
          />
        </View>

        <View style={styles.secondsPickerContainer}>
          <ScrollPicker
            value={seconds}
            onChange={setSeconds}
            options={SECONDS_OPTIONS}
            unit="seconds"
            width={50}
          />
        </View>

        <View style={styles.strokePickerContainer}>
          <ScrollPicker
            value={stroke}
            onChange={setStroke}
            options={STROKE_OPTIONS}
            width={112}
          />
        </View>
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
    marginTop: IMAGE_HEIGHT - 20,
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
    marginBottom: 22,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    marginBottom: 26,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  multiplier: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginHorizontal: 12,
    marginBottom: 32,
  },
  secondsPickerContainer: {
    marginBottom: 16,
  },
  strokePickerContainer: {
    marginBottom: 16,
  },
});


