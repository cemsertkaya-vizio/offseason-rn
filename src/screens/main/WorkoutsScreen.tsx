import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  PanGestureHandler,
  State,
  LongPressGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutCard } from '../../components/WorkoutCard';
import { TimelineIndicator } from '../../components/TimelineIndicator';
import { GoalsDisplay } from '../../components/GoalsDisplay';
import { useProfile } from '../../contexts/ProfileContext';
import { useWorkout } from '../../contexts/WorkoutContext';
import { getCurrentWeekRange } from '../../utils/dateUtils';
import { RootStackParamList } from '../../types/navigation';
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

const CARD_HEIGHT = 76;

export const WorkoutsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useProfile();
  const { season, isLoading, error, refreshSeason, swapDays, isSaving } = useWorkout();
  const userName = profile?.first_name || '';
  const weekRange = getCurrentWeekRange();
  const goals = profile?.goals || [];

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const rowPositions = useRef<number[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const panRef = useRef(null);
  const longPressRef = useRef(null);

  const workouts = useMemo(() => {
    if (!season) {
      return [];
    }
    return transformSeasonToDisplayWorkouts(season);
  }, [season]);

  const handleRowLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    rowPositions.current[index] = y;
  }, []);

  const getTargetIndexFromY = useCallback((currentY: number, originIndex: number): number | null => {
    const positions = rowPositions.current;
    const originY = positions[originIndex] || 0;
    const absoluteY = originY + currentY;

    for (let i = 0; i < positions.length; i++) {
      if (i === originIndex) continue;
      const rowY = positions[i];
      if (absoluteY >= rowY - CARD_HEIGHT / 2 && absoluteY < rowY + CARD_HEIGHT / 2) {
        return i;
      }
    }
    return null;
  }, []);

  const handleLongPressStateChange = useCallback((index: number, event: LongPressGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log('WorkoutsScreen - Long press activated on day:', workouts[index]?.day);
      setDraggingIndex(index);
      dragY.setValue(0);
    }
  }, [workouts, dragY]);

  const handlePanGestureEvent = useCallback((index: number, event: PanGestureHandlerGestureEvent) => {
    if (draggingIndex !== index) return;
    
    const { translationY } = event.nativeEvent;
    dragY.setValue(translationY);
    
    const newTarget = getTargetIndexFromY(translationY, index);
    if (newTarget !== targetIndex) {
      setTargetIndex(newTarget);
    }
  }, [draggingIndex, dragY, getTargetIndexFromY, targetIndex]);

  const handlePanStateChange = useCallback(async (index: number, event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      if (draggingIndex !== null && targetIndex !== null && draggingIndex !== targetIndex) {
        const fromDay = workouts[draggingIndex]?.day;
        const toDay = workouts[targetIndex]?.day;
        
        if (fromDay && toDay) {
          console.log('WorkoutsScreen - Swapping days:', fromDay, 'with', toDay);
          const success = await swapDays(fromDay, toDay);
          if (!success) {
            Alert.alert('Error', 'Failed to swap workouts. Please try again.');
          }
        }
      }
      
      setDraggingIndex(null);
      setTargetIndex(null);
      dragY.setValue(0);
    }
  }, [draggingIndex, targetIndex, workouts, swapDays, dragY]);

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
        <TouchableOpacity style={styles.retryButton} onPress={refreshSeason}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderWorkoutRow = (dayWorkout: DisplayDayWorkout, index: number) => {
    const nextWorkout = workouts[index + 1];
    const isNextCompleted = nextWorkout?.isCompleted ?? false;
    const hasDualWorkouts = dayWorkout.workouts.length === 2;
    const isDragging = draggingIndex === index;
    const isTarget = targetIndex === index;

    const animatedStyle = isDragging
      ? {
          transform: [{ translateY: dragY }],
          zIndex: 1000,
          elevation: 10,
        }
      : {};

    const rowContent = (
      <Animated.View
        style={[
          styles.workoutRow,
          animatedStyle,
          isDragging && styles.draggingRow,
          isTarget && styles.targetRow,
        ]}
        onLayout={(e) => handleRowLayout(index, e)}
      >
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
                onPress={() => !isDragging && handleWorkoutPress(dayWorkout.workouts[0], dayWorkout)}
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
                onPress={() => !isDragging && handleWorkoutPress(dayWorkout.workouts[1], dayWorkout)}
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
              onPress={() => !isDragging && handleWorkoutPress(dayWorkout.workouts[0], dayWorkout)}
            />
          </View>
        )}
      </Animated.View>
    );

    return (
      <LongPressGestureHandler
        key={dayWorkout.day}
        ref={longPressRef}
        onHandlerStateChange={(e) => handleLongPressStateChange(index, e)}
        minDurationMs={400}
        enabled={!isSaving}
      >
        <View>
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={(e) => handlePanGestureEvent(index, e)}
            onHandlerStateChange={(e) => handlePanStateChange(index, e)}
            enabled={draggingIndex === index}
          >
            {rowContent}
          </PanGestureHandler>
        </View>
      </LongPressGestureHandler>
    );
  };

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
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

        {draggingIndex !== null && (
          <View style={styles.dragHint}>
            <Icon name="swap-vert" size={16} color={colors.yellow} />
            <Text style={styles.dragHintText}>Drag to swap with another day</Text>
          </View>
        )}

        <GoalsDisplay goals={goals} />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={draggingIndex === null}
        >
          {workouts.map((dayWorkout, index) => renderWorkoutRow(dayWorkout, index))}
          <View style={styles.expandIndicator}>
            <Icon name="keyboard-arrow-down" size={24} color={colors.offWhite} />
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
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
  draggingRow: {
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: colors.darkBrown,
    borderRadius: 12,
  },
  targetRow: {
    backgroundColor: 'rgba(255, 204, 51, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.yellow,
    borderStyle: 'dashed',
  },
  dragHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 204, 51, 0.15)',
    marginHorizontal: 34,
    borderRadius: 8,
    gap: 8,
  },
  dragHintText: {
    fontFamily: 'Bebas Neue',
    fontSize: 14,
    color: colors.yellow,
    textTransform: 'uppercase',
  },
});
