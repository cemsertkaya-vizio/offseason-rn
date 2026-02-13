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
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';
import { activityNavigationService } from '../../../services/activityNavigationService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type YogaScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Yoga'
>;

interface YogaScreenProps {
  navigation: YogaScreenNavigationProp;
}

type YogaMembership = 'yes' | 'tryingNew' | 'onOwn' | null;

const OPTIONS = [
  { id: 'yes' as const, label: 'Yes' },
  { id: 'tryingNew' as const, label: 'No, I like trying new studios' },
  { id: 'onOwn' as const, label: 'No, I do yoga on my own' },
];

export const YogaScreen: React.FC<YogaScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [selectedMembership, setSelectedMembership] = useState<YogaMembership>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('YogaScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile?.onboarding_data?.yoga?.membership) {
        console.log('YogaScreen - Pre-filling with saved membership');
        setSelectedMembership(result.profile.onboarding_data.yoga.membership);
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
    console.log('YogaScreen - Saving progress with membership:', selectedMembership);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      yoga: {
        ...existingData.yoga,
        membership: selectedMembership,
      },
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'yoga_membership',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('YogaScreen - Error saving progress:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedMembership === 'yes') {
      setIsSaving(false);
      console.log('YogaScreen - Has membership, navigating to studio screen');
      navigation.navigate('YogaStudio');
    } else {
      console.log('YogaScreen - No studio membership, marking activity as completed');

      const marked = await activityNavigationService.markActivityCompleted(user.id, 'Yoga');

      if (!marked) {
        setIsSaving(false);
        Alert.alert('Error', 'Could not complete activity. Please try again.', [{ text: 'OK' }]);
        return;
      }

      const { screen } = await activityNavigationService.getNextActivityScreen(user.id, 'Yoga');

      setIsSaving(false);

      if (screen) {
        console.log('YogaScreen - Navigating to next activity:', screen);
        navigation.navigate(screen as any);
      } else {
        console.log('YogaScreen - All activities complete, navigating to RegisterGoals');
        navigation.navigate('RegisterGoals');
      }
    }
  };

  const isNextDisabled = selectedMembership === null || isSaving;

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
          source={require('../../../assets/coach-yoga.png')}
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
        <Text style={styles.title}>YOGA</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.question}>
          Do you have a yoga studio membership?
        </Text>

        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedMembership === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedMembership(option.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedMembership === option.id && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 42,
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
  },
  optionButtonSelected: {
    backgroundColor: colors.beige,
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

