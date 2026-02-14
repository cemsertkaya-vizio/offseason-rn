import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
  DragEndParams,
} from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutCard } from '../../components/WorkoutCard';
import { TimelineIndicator } from '../../components/TimelineIndicator';
import { GoalsDisplay } from '../../components/GoalsDisplay';
import { useProfile } from '../../contexts/ProfileContext';
import { useWorkout } from '../../contexts/WorkoutContext';
import { getCurrentWeekRange, isDateStringInWeek } from '../../utils/dateUtils';
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
  date: string;
  originalDateKey: string;
  weekIndex: number;
  isCompleted: boolean;
  workouts: DisplayWorkout[];
  isRestDay: boolean;
}

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

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const transformWeekToDisplayWorkouts = (
  week: { days: Record<string, DayWorkout> },
  weekIndex: number,
  weekOffset: number
): DisplayDayWorkout[] => {
  const days = week.days;
  const sortedDateKeys = Object.keys(days).sort();

  const filteredKeys = sortedDateKeys.filter((dateKey) => {
    if (ISO_DATE_REGEX.test(dateKey)) {
      return isDateStringInWeek(dateKey, weekOffset);
    }
    return true;
  });

  return filteredKeys.map((dateKey) => {
    const dayData: DayWorkout = days[dateKey];
    const dayName = dayData.day_name || dateKey;
    const listKey = `${weekIndex}-${dateKey}`;

    if (dayData.rest_day) {
      return {
        day: dayName,
        date: listKey,
        originalDateKey: dateKey,
        weekIndex,
        isCompleted: false,
        isRestDay: true,
        workouts: [{
          id: `${listKey}-rest`,
          title: 'Rest Day',
          imageSource: require('../../assets/workouts/workout-rest-day.png'),
          exercises: [],
          goal: 'Recovery and rest',
        }],
      };
    }

    return {
      day: dayName,
      date: listKey,
      originalDateKey: dateKey,
      weekIndex,
      isCompleted: false,
      isRestDay: false,
      workouts: [{
        id: `${listKey}-workout`,
        title: dayData.name || 'Workout',
        imageSource: getWorkoutImage(dayData.name || ''),
        exercises: dayData.exercises || [],
        goal: dayData.goal,
      }],
    };
  });
};

const hasDaysInNextWeek = (season: Season): boolean => {
  if (!season.cycles?.[0]?.weeks?.[0]?.days) {
    return false;
  }
  const dayKeys = Object.keys(season.cycles[0].weeks[0].days);
  return dayKeys.some((key) => ISO_DATE_REGEX.test(key) && isDateStringInWeek(key, 1));
};

const transformSeasonToDisplayWorkouts = (
  season: Season,
  includeNextWeek: boolean
): DisplayDayWorkout[] => {
  if (!season.cycles || season.cycles.length === 0) {
    return [];
  }

  const firstCycle = season.cycles[0];
  if (!firstCycle.weeks || firstCycle.weeks.length === 0) {
    return [];
  }

  const currentWeekWorkouts = transformWeekToDisplayWorkouts(firstCycle.weeks[0], 0, 0);

  if (!includeNextWeek) {
    return currentWeekWorkouts;
  }

  const nextWeekWorkouts =
    firstCycle.weeks.length > 1
      ? transformWeekToDisplayWorkouts(firstCycle.weeks[1], 1, 1)
      : transformWeekToDisplayWorkouts(firstCycle.weeks[0], 0, 1);

  return [...currentWeekWorkouts, ...nextWeekWorkouts];
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WorkoutsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useProfile();
  const { season, isLoading, error, refreshSeason, swapDays, isSaving } = useWorkout();
  const userName = profile?.first_name || '';
  const weekRange = getCurrentWeekRange();
  const goals = profile?.goals || [];

  const [isDragging, setIsDragging] = useState(false);
  const [showNextWeek, setShowNextWeek] = useState(false);

  const workouts = useMemo(() => {
    if (!season) {
      return [];
    }
    return transformSeasonToDisplayWorkouts(season, showNextWeek);
  }, [season, showNextWeek]);

  const handleDragEnd = useCallback(async ({ data, from, to }: DragEndParams<DisplayDayWorkout>) => {
    console.log('WorkoutsScreen - ===== DRAG END =====');
    console.log('WorkoutsScreen - Drag ended from index:', from, 'to index:', to);
    setIsDragging(false);
    
    if (from === to) {
      console.log('WorkoutsScreen - No swap needed, same position');
      return;
    }

    const fromItem = workouts[from];
    const toItem = workouts[to];

    console.log('WorkoutsScreen - From item:', {
      day: fromItem?.day,
      originalDateKey: fromItem?.originalDateKey,
      weekIndex: fromItem?.weekIndex,
      isRestDay: fromItem?.isRestDay,
      workoutTitle: fromItem?.workouts[0]?.title
    });
    console.log('WorkoutsScreen - To item:', {
      day: toItem?.day,
      originalDateKey: toItem?.originalDateKey,
      weekIndex: toItem?.weekIndex,
      isRestDay: toItem?.isRestDay,
      workoutTitle: toItem?.workouts[0]?.title
    });

    if (!fromItem || !toItem) {
      console.log('WorkoutsScreen - Swap rejected: Items not valid');
      return;
    }

    const fromDate = fromItem.originalDateKey;
    const toDate = toItem.originalDateKey;
    const weekIndex = fromItem.weekIndex;
    
    if (fromDate && toDate) {
      console.log('WorkoutsScreen - Calling swapDays with:', fromDate, 'and', toDate, 'weekIndex:', weekIndex);
      const success = await swapDays(fromDate, toDate, weekIndex);
      console.log('WorkoutsScreen - Swap result:', success);
      
      LayoutAnimation.configureNext({
        duration: 300,
        create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      });
      
      if (!success) {
        console.log('WorkoutsScreen - ERROR: Swap failed');
        Alert.alert('Error', 'Failed to swap workouts. Please try again.');
      } else {
        console.log('WorkoutsScreen - Swap completed successfully');
      }
    } else {
      console.log('WorkoutsScreen - ERROR: Missing fromDate or toDate');
    }
    console.log('WorkoutsScreen - ===== DRAG END COMPLETE =====');
  }, [workouts, swapDays]);

  const handleDragBegin = useCallback(() => {
    setIsDragging(true);
    console.log('WorkoutsScreen - Drag started');
  }, []);

  const handleWorkoutPress = useCallback((workout: DisplayWorkout, dayWorkout: DisplayDayWorkout) => {
    if (dayWorkout.weekIndex !== 0) {
      return;
    }
    console.log('WorkoutsScreen - Workout pressed:', workout.id);
    navigation.navigate('WorkoutDetail', {
      workoutId: workout.id,
      workoutTitle: workout.title,
      day: dayWorkout.originalDateKey,
      date: dayWorkout.day,
      duration: workout.exercises.length * 5,
      exercises: workout.exercises,
      workoutGoal: workout.goal,
    });
  }, [navigation]);

  const handleReferFriendsPress = useCallback(() => {
    console.log('WorkoutsScreen - Refer friends pressed');
    navigation.navigate('ReferFriends');
  }, [navigation]);

  const renderItem = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<DisplayDayWorkout>) => {
    const index = getIndex() ?? 0;
    const nextWorkout = workouts[index + 1];
    const isNextCompleted = nextWorkout?.isCompleted ?? false;
    const hasDualWorkouts = item.workouts.length === 2;

    const handlePress = () => {
      if (!isActive && !hasDualWorkouts) {
        handleWorkoutPress(item.workouts[0], item);
      }
    };

    const canDrag = true;

    return (
      <ScaleDecorator activeScale={1.03}>
        <TouchableOpacity
          onLongPress={canDrag ? drag : undefined}
          onPress={handlePress}
          delayLongPress={150}
          activeOpacity={0.9}
          style={[
            styles.workoutRow,
            isActive && styles.draggingRow,
          ]}
        >
          <TimelineIndicator
            isCompleted={item.isCompleted}
            isFirst={index === 0}
            isLast={index === workouts.length - 1}
            isNextCompleted={isNextCompleted}
          />
          {hasDualWorkouts ? (
            <View style={styles.dualCardWrapper}>
              <View style={styles.leftCardWrapper}>
                <WorkoutCard
                  day={item.day}
                  title={item.workouts[0].title}
                  imageSource={item.workouts[0].imageSource}
                  onPress={() => !isActive && handleWorkoutPress(item.workouts[0], item)}
                  onLongPress={canDrag ? drag : undefined}
                  position="left"
                  showDay={true}
                  showArrow={false}
                />
              </View>
              <View style={styles.rightCardWrapper}>
                <WorkoutCard
                  day={item.day}
                  title={item.workouts[1].title}
                  imageSource={item.workouts[1].imageSource}
                  onPress={() => !isActive && handleWorkoutPress(item.workouts[1], item)}
                  onLongPress={canDrag ? drag : undefined}
                  position="right"
                  showDay={false}
                  showArrow={true}
                />
              </View>
            </View>
          ) : (
            <View style={styles.cardWrapper} pointerEvents={isActive ? 'none' : 'auto'}>
              <WorkoutCard
                day={item.day}
                title={item.workouts[0].title}
                imageSource={item.workouts[0].imageSource}
                onPress={handlePress}
                onLongPress={canDrag ? drag : undefined}
              />
            </View>
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [workouts, handleWorkoutPress]);

  const keyExtractor = useCallback((item: DisplayDayWorkout) => item.date, []);

  const hasNextWeek = (season?.cycles?.[0]?.weeks?.length ?? 0) > 1 || (season ? hasDaysInNextWeek(season) : false);

  const ListFooterComponent = useCallback(() => {
    if (!hasNextWeek) {
      return null;
    }
    if (showNextWeek) {
      return (
        <TouchableOpacity
          style={styles.expandIndicator}
          onPress={() => setShowNextWeek(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>Show less</Text>
          <Icon name="keyboard-arrow-up" size={24} color={colors.offWhite} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.expandIndicator}
        onPress={() => setShowNextWeek(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>Show next week</Text>
        <Icon name="keyboard-arrow-down" size={24} color={colors.offWhite} />
      </TouchableOpacity>
    );
  }, [hasNextWeek, showNextWeek]);

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

        {isDragging && (
          <View style={styles.dragHint}>
            <Icon name="swap-vert" size={16} color={colors.yellow} />
            <Text style={styles.dragHintText}>Drag to swap with another day</Text>
          </View>
        )}

        <GoalsDisplay goals={goals} />

        <DraggableFlatList
          key={`workout-list-${workouts.map(w => `${w.date}-${w.workouts[0]?.title || 'empty'}`).join('-')}`}
          data={workouts}
          onDragEnd={handleDragEnd}
          onDragBegin={handleDragBegin}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          containerStyle={styles.listContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={ListFooterComponent}
          dragItemOverflow={true}
          extraData={isSaving}
        />
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
  listContainer: {
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
    gap: 4,
  },
  expandText: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.offWhite,
    textTransform: 'uppercase',
  },
  draggingRow: {
    opacity: 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    backgroundColor: colors.darkBrown,
    borderRadius: 12,
    elevation: 10,
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
