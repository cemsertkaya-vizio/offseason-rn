import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutCard } from '../../components/WorkoutCard';
import { TimelineIndicator } from '../../components/TimelineIndicator';
import { GoalsDisplay } from '../../components/GoalsDisplay';
import { useProfile } from '../../contexts/ProfileContext';
import { getCurrentWeekRange } from '../../utils/dateUtils';

interface WorkoutItem {
  id: string;
  day: string;
  title: string;
  isCompleted: boolean;
  imageSource: number;
}

const mockWorkouts: WorkoutItem[] = [
  {
    id: '1',
    day: 'Monday',
    title: 'Lower Body',
    isCompleted: true,
    imageSource: require('../../assets/workouts/workout-lower-body.png'),
  },
  {
    id: '2',
    day: 'Tuesday',
    title: 'Swim',
    isCompleted: true,
    imageSource: require('../../assets/workouts/workout-swim.png'),
  },
  {
    id: '3',
    day: 'Wednesday',
    title: 'Hot Yoga',
    isCompleted: true,
    imageSource: require('../../assets/workouts/workout-hot-yoga.png'),
  },
  {
    id: '4',
    day: 'Thursday',
    title: 'Contrast Therapy',
    isCompleted: false,
    imageSource: require('../../assets/workouts/workout-contrast-therapy.png'),
  },
  {
    id: '5',
    day: 'Friday',
    title: 'Outdoor Run',
    isCompleted: false,
    imageSource: require('../../assets/workouts/workout-outdoor-run.png'),
  },
  {
    id: '6',
    day: 'Saturday',
    title: 'Studio Pilates',
    isCompleted: false,
    imageSource: require('../../assets/workouts/workout-studio-pilates.png'),
  },
  {
    id: '7',
    day: 'Sunday',
    title: 'Rest Day',
    isCompleted: false,
    imageSource: require('../../assets/workouts/workout-rest-day.png'),
  },
];

export const WorkoutsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const userName = profile?.first_name || '';
  const weekRange = getCurrentWeekRange();
  const goals = profile?.goals || [];

  const handleWorkoutPress = (workoutId: string) => {
    console.log('WorkoutsScreen - Workout pressed:', workoutId);
  };

  const handleReferFriendsPress = () => {
    console.log('WorkoutsScreen - Refer friends pressed');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
        <View style={styles.subHeader}>
          <View style={styles.weekContainer}>
            <Icon2 name="calendar-blank" size={16} color={colors.offWhite} />
            <Text style={styles.weekText}>Week of {weekRange}</Text>
          </View>
          <TouchableOpacity
            style={styles.referContainer}
            onPress={handleReferFriendsPress}
          >
            <Icon name="navigation" size={14} color={colors.yellow} />
            <Text style={styles.referText}>refer friends</Text>
          </TouchableOpacity>
        </View>
      </View>

      <GoalsDisplay goals={goals} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockWorkouts.map((workout, index) => {
          const nextWorkout = mockWorkouts[index + 1];
          const isNextCompleted = nextWorkout?.isCompleted ?? false;
          
          return (
            <View key={workout.id} style={styles.workoutRow}>
              <TimelineIndicator
                isCompleted={workout.isCompleted}
                isFirst={index === 0}
                isLast={index === mockWorkouts.length - 1}
                isNextCompleted={isNextCompleted}
              />
              <View style={styles.cardWrapper}>
                <WorkoutCard
                  day={workout.day}
                  title={workout.title}
                  imageSource={workout.imageSource}
                  onPress={() => handleWorkoutPress(workout.id)}
                />
              </View>
            </View>
          );
        })}
        <View style={styles.expandIndicator}>
          <Icon name="keyboard-arrow-down" size={24} color={colors.offWhite} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  header: {
    paddingHorizontal: 34,
    paddingTop: 24,
    paddingBottom: 8,
  },
  welcomeText: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.offWhite,
    lineHeight: 51,
    textTransform: 'uppercase',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekText: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.offWhite,
    lineHeight: 26,
    textTransform: 'uppercase',
  },
  referContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 4,
  },
  referText: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.yellow,
    lineHeight: 26,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
    marginTop: 12,
  },
  scrollContent: {
    paddingLeft: 27,
    paddingRight: 0,
    paddingBottom: 100,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardWrapper: {
    flex: 1,
    height: 76,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
