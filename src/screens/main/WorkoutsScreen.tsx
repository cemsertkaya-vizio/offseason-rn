import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutCard } from '../../components/WorkoutCard';
import { TimelineIndicator } from '../../components/TimelineIndicator';
import { GoalsDisplay } from '../../components/GoalsDisplay';
import { useProfile } from '../../contexts/ProfileContext';
import { getCurrentWeekRange } from '../../utils/dateUtils';
import { RootStackParamList } from '../../types/navigation';

interface SingleWorkout {
  id: string;
  title: string;
  imageSource: number;
}

interface DayWorkout {
  day: string;
  isCompleted: boolean;
  workouts: SingleWorkout[];
}

const mockWorkouts: DayWorkout[] = [
  {
    day: 'Monday',
    isCompleted: true,
    workouts: [
      {
        id: '1a',
        title: 'Lower Body',
        imageSource: require('../../assets/workouts/workout-lower-body.png'),
      },
      {
        id: '1b',
        title: 'Run',
        imageSource: require('../../assets/workouts/workout-outdoor-run.png'),
      },
    ],
  },
  {
    day: 'Tuesday',
    isCompleted: true,
    workouts: [
      {
        id: '2',
        title: 'Swim',
        imageSource: require('../../assets/workouts/workout-swim.png'),
      },
    ],
  },
  {
    day: 'Wednesday',
    isCompleted: true,
    workouts: [
      {
        id: '3',
        title: 'Hot Yoga',
        imageSource: require('../../assets/workouts/workout-hot-yoga.png'),
      },
    ],
  },
  {
    day: 'Thursday',
    isCompleted: false,
    workouts: [
      {
        id: '4',
        title: 'Contrast Therapy',
        imageSource: require('../../assets/workouts/workout-contrast-therapy.png'),
      },
    ],
  },
  {
    day: 'Friday',
    isCompleted: false,
    workouts: [
      {
        id: '5',
        title: 'Outdoor Run',
        imageSource: require('../../assets/workouts/workout-outdoor-run.png'),
      },
    ],
  },
  {
    day: 'Saturday',
    isCompleted: false,
    workouts: [
      {
        id: '6',
        title: 'Studio Pilates',
        imageSource: require('../../assets/workouts/workout-studio-pilates.png'),
      },
    ],
  },
  {
    day: 'Sunday',
    isCompleted: false,
    workouts: [
      {
        id: '7',
        title: 'Rest Day',
        imageSource: require('../../assets/workouts/workout-rest-day.png'),
      },
    ],
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WorkoutsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useProfile();
  const userName = profile?.first_name || '';
  const weekRange = getCurrentWeekRange();
  const goals = profile?.goals || [];

  const handleWorkoutPress = (workout: SingleWorkout, dayWorkout: DayWorkout) => {
    console.log('WorkoutsScreen - Workout pressed:', workout.id);
    navigation.navigate('WorkoutDetail', {
      workoutId: workout.id,
      workoutTitle: workout.title,
      day: dayWorkout.day,
      duration: 40,
    });
  };

  const handleReferFriendsPress = () => {
    console.log('WorkoutsScreen - Refer friends pressed');
    navigation.navigate('ReferFriends');
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
        {mockWorkouts.map((dayWorkout, index) => {
          const nextWorkout = mockWorkouts[index + 1];
          const isNextCompleted = nextWorkout?.isCompleted ?? false;
          const hasDualWorkouts = dayWorkout.workouts.length === 2;
          
          return (
            <View key={dayWorkout.day} style={styles.workoutRow}>
              <TimelineIndicator
                isCompleted={dayWorkout.isCompleted}
                isFirst={index === 0}
                isLast={index === mockWorkouts.length - 1}
                isNextCompleted={isNextCompleted}
              />
              {hasDualWorkouts ? (
                <View style={styles.dualCardWrapper}>
                  <View style={styles.leftCardWrapper}>
                    <WorkoutCard
                      day={dayWorkout.day}
                      title={dayWorkout.workouts[0].title}
                      imageSource={dayWorkout.workouts[0].imageSource}
                      onPress={() => handleWorkoutPress(dayWorkout.workouts[0], dayWorkout)}
                      position="left"
                      showDay={true}
                      showArrow={false}
                    />
                  </View>
                  <View style={styles.rightCardWrapper}>
                    <WorkoutCard
                      day={dayWorkout.day}
                      title={dayWorkout.workouts[1].title}
                      imageSource={dayWorkout.workouts[1].imageSource}
                      onPress={() => handleWorkoutPress(dayWorkout.workouts[1], dayWorkout)}
                      position="right"
                      showDay={false}
                      showArrow={true}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.cardWrapper}>
                  <WorkoutCard
                    day={dayWorkout.day}
                    title={dayWorkout.workouts[0].title}
                    imageSource={dayWorkout.workouts[0].imageSource}
                    onPress={() => handleWorkoutPress(dayWorkout.workouts[0], dayWorkout)}
                  />
                </View>
              )}
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
  dualCardWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 76,
  },
  leftCardWrapper: {
    flex: 1,
    height: 76,
  },
  rightCardWrapper: {
    flex: 1.1,
    height: 76,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
