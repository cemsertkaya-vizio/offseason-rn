import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { NavigationArrows } from '../../components/NavigationArrows';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

const WEEKDAYS = [
  { id: 'M', label: 'M' },
  { id: 'Tu', label: 'Tu' },
  { id: 'W', label: 'W' },
  { id: 'Th', label: 'Th' },
  { id: 'F', label: 'F' },
  { id: 'Sa', label: 'Sa' },
  { id: 'Su', label: 'Su' },
];

type RegisterPreferredDaysScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterPreferredDays'
>;

type RegisterPreferredDaysScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterPreferredDays'
>;

interface RegisterPreferredDaysScreenProps {
  navigation: RegisterPreferredDaysScreenNavigationProp;
  route: RegisterPreferredDaysScreenRouteProp;
}

type PreferredDaysState = Record<string, string[]>;

export const RegisterPreferredDaysScreen: React.FC<RegisterPreferredDaysScreenProps> = ({
  navigation,
  route,
}) => {
  const { activities } = route.params;
  const [preferredDays, setPreferredDays] = useState<PreferredDaysState>(() => {
    const initial: PreferredDaysState = {};
    activities.forEach((activity) => {
      initial[activity] = [];
    });
    return initial;
  });
  const [noPreference, setNoPreference] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterPreferredDaysScreen - Next pressed with preferred days:', preferredDays);
    navigation.navigate('Weightlifting');
  };

  const toggleDay = (activity: string, dayId: string) => {
    setNoPreference(false);
    setPreferredDays((prev) => {
      const currentDays = prev[activity] || [];
      if (currentDays.includes(dayId)) {
        return {
          ...prev,
          [activity]: currentDays.filter((d) => d !== dayId),
        };
      }
      return {
        ...prev,
        [activity]: [...currentDays, dayId],
      };
    });
  };

  const handleNoPreference = () => {
    setNoPreference(true);
    const cleared: PreferredDaysState = {};
    activities.forEach((activity) => {
      cleared[activity] = [];
    });
    setPreferredDays(cleared);
  };

  const hasAnySelection = Object.values(preferredDays).some((days) => days.length > 0);
  const isNextDisabled = !noPreference && !hasAnySelection;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/coach-preferences.png')}
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
        <Text style={styles.title}>PREFERRED DAYS OF THE WEEK</Text>
        <Text style={styles.subtitle}>
          We'll use this to build your training week.
        </Text>

        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <View key={activity} style={styles.activityRow}>
              <Text style={styles.activityLabel}>{activity}</Text>
              <View style={styles.daysContainer}>
                {WEEKDAYS.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      preferredDays[activity]?.includes(day.id) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(activity, day.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        preferredDays[activity]?.includes(day.id) && styles.dayTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.noPreferenceButton,
            noPreference && styles.noPreferenceButtonSelected,
          ]}
          onPress={handleNoPreference}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.noPreferenceText,
              noPreference && styles.noPreferenceTextSelected,
            ]}
          >
            I have no preference
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 28,
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
  activitiesContainer: {
    gap: 28,
  },
  activityRow: {
    gap: 12,
  },
  activityLabel: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 9,
  },
  dayButton: {
    width: 42,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.beige,
  },
  dayText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
  },
  dayTextSelected: {
    color: colors.darkBrown,
  },
  noPreferenceButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginHorizontal: 14,
  },
  noPreferenceButtonSelected: {
    backgroundColor: colors.beige,
  },
  noPreferenceText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  noPreferenceTextSelected: {
    color: colors.darkBrown,
  },
});

