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
const DAYS = [1, 2, 3, 4, 5, 6, 7];

type RegisterScheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterSchedule'
>;

type RegisterScheduleScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterSchedule'
>;

interface RegisterScheduleScreenProps {
  navigation: RegisterScheduleScreenNavigationProp;
  route: RegisterScheduleScreenRouteProp;
}

type ScheduleState = Record<string, number | null>;

export const RegisterScheduleScreen: React.FC<RegisterScheduleScreenProps> = ({
  navigation,
  route,
}) => {
  const { activities } = route.params;
  const [schedule, setSchedule] = useState<ScheduleState>(() => {
    const initial: ScheduleState = {};
    activities.forEach((activity) => {
      initial[activity] = null;
    });
    return initial;
  });
  const [noPreference, setNoPreference] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterScheduleScreen - Next pressed with schedule:', schedule);
    navigation.navigate('RegisterPreferredDays', { activities });
  };

  const handleDaySelect = (activity: string, day: number) => {
    setNoPreference(false);
    setSchedule((prev) => ({
      ...prev,
      [activity]: prev[activity] === day ? null : day,
    }));
  };

  const handleNoPreference = () => {
    setNoPreference(true);
    const cleared: ScheduleState = {};
    activities.forEach((activity) => {
      cleared[activity] = null;
    });
    setSchedule(cleared);
  };

  const hasAnySelection = Object.values(schedule).some((v) => v !== null);
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
        <Text style={styles.title}>WHAT'S YOUR SPLIT?</Text>
        <Text style={styles.subtitle}>
          We'll use this to build your training week.
        </Text>

        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <View key={activity} style={styles.activityRow}>
              <Text style={styles.activityLabel}>{activity}</Text>
              <View style={styles.daysRow}>
                <View style={styles.daysContainer}>
                  {DAYS.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        schedule[activity] === day && styles.dayButtonSelected,
                      ]}
                      onPress={() => handleDaySelect(activity, day)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          schedule[activity] === day && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.daysPerWeekLabel}>days /{'\n'}week</Text>
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
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 9,
  },
  dayButton: {
    width: 36,
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
  daysPerWeekLabel: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: colors.gray.muted,
    marginLeft: 10,
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

