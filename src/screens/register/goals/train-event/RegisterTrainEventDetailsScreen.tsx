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
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { ScrollPicker } from '../../../../components/ScrollPicker';
import { colors } from '../../../../constants/colors';
import { useAuth } from '../../../../contexts/AuthContext';
import { profileService } from '../../../../services/profileService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterTrainEventDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterTrainEventDetails'
>;

type RegisterTrainEventDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterTrainEventDetails'
>;

interface RegisterTrainEventDetailsScreenProps {
  navigation: RegisterTrainEventDetailsScreenNavigationProp;
  route: RegisterTrainEventDetailsScreenRouteProp;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

export const RegisterTrainEventDetailsScreen: React.FC<RegisterTrainEventDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventType } = route.params;
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
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
          const savedMonth = result.profile.onboarding_data.train_event_month as string;
          const savedYear = result.profile.onboarding_data.train_event_year as number;
          if (savedMonth) {
            console.log('RegisterTrainEventDetailsScreen - Loading saved month:', savedMonth);
            setSelectedMonth(savedMonth);
          }
          if (savedYear) {
            console.log('RegisterTrainEventDetailsScreen - Loading saved year:', savedYear);
            setSelectedYear(savedYear);
          }
        }
      } catch (error) {
        console.log('RegisterTrainEventDetailsScreen - Error loading existing data:', error);
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

    console.log('RegisterTrainEventDetailsScreen - Event type:', eventType);
    console.log('RegisterTrainEventDetailsScreen - Event date:', selectedMonth, selectedYear);

    setIsSaving(true);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      train_event_month: selectedMonth,
      train_event_year: selectedYear,
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'train_event_date_selected',
      { onboarding_data: updatedData }
    );

    setIsSaving(false);

    if (!saveResult.success) {
      console.log('RegisterTrainEventDetailsScreen - Error saving date:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('RegisterTrainEventDetailsScreen - Date saved successfully');
    navigation.navigate('RegisterTrainEventTrainingStatus', {
      eventType,
      eventMonth: selectedMonth,
      eventYear: selectedYear,
    });
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
          source={require('../../../../assets/coach-athlete.png')}
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
        <Text style={styles.title}>TRAIN FOR AN EVENT</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          When is the event?
        </Text>

        <View style={styles.datePickerContainer}>
          <ScrollPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={MONTHS}
            width={127}
          />
          <View style={styles.pickerSpacing} />
          <ScrollPicker
            value={selectedYear}
            onChange={setSelectedYear}
            options={YEARS}
            width={63}
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
    marginBottom: 64,
    width: '100%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pickerSpacing: {
    width: 16,
  },
});

