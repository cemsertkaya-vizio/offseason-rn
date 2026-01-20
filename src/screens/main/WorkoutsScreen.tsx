import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { workoutService } from '../../services/workoutService';
import type { Season, DayWorkout, WorkoutExercise } from '../../types/workout';

interface DisplayWorkout {
  id: string;
  title: string;
  imageSource: number;
  exercises: WorkoutExercise[];
  goal?: string;
}

interface DisplayDayWorkout {
  day: string;
  isCompleted: boolean;
  workouts: DisplayWorkout[];
  isRestDay: boolean;
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getWorkoutImage = (workoutName: string): number => {
  const name = workoutName.toLowerCase();
  
  if (name.includes('lower') || name.includes('squat') || name.includes('deadlift') || name.includes('leg')) {
    return require('../../assets/workouts/workout-lower-body.png');
  }
  if (name.includes('run')) {
    return require('../../assets/workouts/workout-outdoor-run.png');
  }
  if (name.includes('swim')) {
    return require('../../assets/workouts/workout-swim.png');
  }
  if (name.includes('yoga')) {
    return require('../../assets/workouts/workout-hot-yoga.png');
  }
  if (name.includes('pilates')) {
    return require('../../assets/workouts/workout-studio-pilates.png');
  }
  if (name.includes('rest') || name.includes('recovery')) {
    return require('../../assets/workouts/workout-rest-day.png');
  }
  if (name.includes('upper') || name.includes('push') || name.includes('pull') || name.includes('press')) {
    return require('../../assets/workouts/workout-contrast-therapy.png');
  }
  if (name.includes('core') || name.includes('stability')) {
    return require('../../assets/workouts/workout-hot-yoga.png');
  }
  if (name.includes('full body')) {
    return require('../../assets/workouts/workout-lower-body.png');
  }
  
  return require('../../assets/workouts/workout-outdoor-run.png');
};

const transformSeasonToDisplayWorkouts = (season: Season): DisplayDayWorkout[] => {
  if (!season.cycles || season.cycles.length === 0) {
    return [];
  }

  const firstCycle = season.cycles[0];
  if (!firstCycle.weeks || firstCycle.weeks.length === 0) {
    return [];
  }

  const firstWeek = firstCycle.weeks[0];
  const days = firstWeek.days;

  return DAY_ORDER.map((dayName, index) => {
    const dayData: DayWorkout | undefined = days[dayName];

    if (!dayData || dayData.rest_day) {
      return {
        day: dayName,
        isCompleted: false,
        isRestDay: true,
        workouts: [{
          id: `${dayName}-rest`,
          title: 'Rest Day',
          imageSource: require('../../assets/workouts/workout-rest-day.png'),
          exercises: [],
          goal: 'Recovery and rest',
        }],
      };
    }

    return {
      day: dayName,
      isCompleted: false,
      isRestDay: false,
      workouts: [{
        id: `${dayName}-${index}`,
        title: dayData.name || 'Workout',
        imageSource: getWorkoutImage(dayData.name || ''),
        exercises: dayData.exercises || [],
        goal: dayData.goal,
      }],
    };
  });
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WorkoutsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useProfile();
  const userName = profile?.first_name || '';
  const weekRange = getCurrentWeekRange();
  const goals = profile?.goals || [];

  const [workouts, setWorkouts] = useState<DisplayDayWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('WorkoutsScreen - Fetching workout season');
      const result = await workoutService.loadExistingSeason();

      if (result.success && result.season) {
        console.log('WorkoutsScreen - Season loaded successfully');
        const displayWorkouts = transformSeasonToDisplayWorkouts(result.season);
        setWorkouts(displayWorkouts);
      } else if (result.error?.includes('No season found')) {
        console.log('WorkoutsScreen - No existing season, building new one');
        const buildResult = await workoutService.buildWorkoutSeason();
        
        if (buildResult.success && buildResult.season) {
          console.log('WorkoutsScreen - New season built successfully');
          const displayWorkouts = transformSeasonToDisplayWorkouts(buildResult.season);
          setWorkouts(displayWorkouts);
        } else {
          console.log('WorkoutsScreen - Failed to build season:', buildResult.error);
          setError(buildResult.error || 'Failed to build workout season');
        }
      } else {
        console.log('WorkoutsScreen - Failed to load season:', result.error);
        setError(result.error || 'Failed to load workout season');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('WorkoutsScreen - Exception fetching workouts:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleWorkoutPress = (workout: DisplayWorkout, dayWorkout: DisplayDayWorkout) => {
    console.log('WorkoutsScreen - Workout pressed:', workout.id);
    navigation.navigate('WorkoutDetail', {
      workoutId: workout.id,
      workoutTitle: workout.title,
      day: dayWorkout.day,
      duration: workout.exercises.length * 5,
      exercises: workout.exercises,
      workoutGoal: workout.goal,
    });
  };

  const handleReferFriendsPress = () => {
    console.log('WorkoutsScreen - Refer friends pressed');
    navigation.navigate('ReferFriends');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Icon name="error-outline" size={48} color={colors.offWhite} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWorkouts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        {workouts.map((dayWorkout, index) => {
          const nextWorkout = workouts[index + 1];
          const isNextCompleted = nextWorkout?.isCompleted ?? false;
          const hasDualWorkouts = dayWorkout.workouts.length === 2;
          
          return (
            <View key={dayWorkout.day} style={styles.workoutRow}>
              <TimelineIndicator
                isCompleted={dayWorkout.isCompleted}
                isFirst={index === 0}
                isLast={index === workouts.length - 1}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.yellow,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.darkBrown,
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
