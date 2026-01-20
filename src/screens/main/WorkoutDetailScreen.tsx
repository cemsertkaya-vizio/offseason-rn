import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutExerciseCard } from '../../components/WorkoutExerciseCard';
import { RootStackParamList } from '../../types/navigation';

type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

interface DisplayExercise {
  id: string;
  title: string;
  imageSource: number;
  tags: { label: string }[];
  isCompleted: boolean;
}

const getExerciseImage = (exerciseName: string): number => {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('squat') || name.includes('lunge') || name.includes('leg')) {
    return require('../../assets/workouts/workout-lower-body.png');
  }
  if (name.includes('run')) {
    return require('../../assets/workouts/workout-outdoor-run.png');
  }
  if (name.includes('swim')) {
    return require('../../assets/workouts/workout-swim.png');
  }
  if (name.includes('yoga') || name.includes('stretch')) {
    return require('../../assets/workouts/workout-hot-yoga.png');
  }
  if (name.includes('pilates')) {
    return require('../../assets/workouts/workout-studio-pilates.png');
  }
  if (name.includes('plank') || name.includes('core') || name.includes('bridge')) {
    return require('../../assets/workouts/workout-hot-yoga.png');
  }
  if (name.includes('press') || name.includes('push') || name.includes('bench')) {
    return require('../../assets/workouts/workout-contrast-therapy.png');
  }
  if (name.includes('row') || name.includes('pull') || name.includes('deadlift')) {
    return require('../../assets/workouts/workout-lower-body.png');
  }
  if (name.includes('hang') || name.includes('balance') || name.includes('walk')) {
    return require('../../assets/workouts/workout-studio-pilates.png');
  }
  
  return require('../../assets/workouts/workout-outdoor-run.png');
};

const formatExerciseTags = (
  sets: number,
  reps: number,
  weight: number
): { label: string }[] => {
  const tags: { label: string }[] = [];
  
  tags.push({ label: `${sets} sets x ${reps} reps` });
  
  if (weight > 0) {
    tags.push({ label: `${weight} lbs` });
  } else {
    tags.push({ label: 'Bodyweight' });
  }
  
  return tags;
};

export const WorkoutDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<WorkoutDetailRouteProp>();

  const { workoutTitle, day, date, duration, exercises: apiExercises, workoutGoal } = route.params;

  const [exercises, setExercises] = useState<DisplayExercise[]>([]);

  useEffect(() => {
    if (apiExercises && apiExercises.length > 0) {
      const transformedExercises: DisplayExercise[] = apiExercises.map((exercise, index) => ({
        id: `${index}-${exercise.name}`,
        title: exercise.name,
        imageSource: getExerciseImage(exercise.name),
        tags: formatExerciseTags(exercise.sets, exercise.reps, exercise.weight),
        isCompleted: false,
      }));
      setExercises(transformedExercises);
    } else {
      setExercises([]);
    }
  }, [apiExercises]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddExercise = () => {
    Alert.alert('Under Development', 'This feature is coming soon.');
    console.log('WorkoutDetailScreen - Add exercise pressed');
  };

  const handleExercisePress = (exerciseId: string) => {
    console.log('WorkoutDetailScreen - Exercise pressed:', exerciseId);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    Alert.alert('Under Development', 'This feature is coming soon.');
    console.log('WorkoutDetailScreen - Remove exercise:', exerciseId);
  };

  const handleToggleComplete = (exerciseId: string) => {
    Alert.alert('Under Development', 'This feature is coming soon.');
    console.log('WorkoutDetailScreen - Toggle complete:', exerciseId);
  };

  const formatDate = () => {
    if (date) {
      return date;
    }
    const now = new Date();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${day}, ${monthNames[now.getMonth()]} ${now.getDate()}`;
  };

  const formatDuration = () => {
    if (duration) {
      return `${duration} MIN`;
    }
    return `${exercises.length * 5} MIN`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={colors.offWhite} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{workoutTitle.toUpperCase()}</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddExercise}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="add" size={24} color={colors.offWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon2 name="calendar-blank" size={13} color={colors.offWhite} />
          <Text style={styles.metaText}>{formatDate()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon2 name="clock-outline" size={13} color={colors.offWhite} />
          <Text style={styles.metaText}>{formatDuration()}</Text>
        </View>
      </View>

      {workoutGoal && (
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>GOAL</Text>
          <Text style={styles.goalText}>{workoutGoal}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon2 name="sleep" size={48} color={colors.offWhite} />
            <Text style={styles.emptyText}>Rest Day</Text>
            <Text style={styles.emptySubtext}>Take time to recover and recharge</Text>
          </View>
        ) : (
          exercises.map(exercise => (
            <WorkoutExerciseCard
              key={exercise.id}
              title={exercise.title}
              imageSource={exercise.imageSource}
              tags={exercise.tags}
              isCompleted={exercise.isCompleted}
              onPress={() => handleExercisePress(exercise.id)}
              onRemove={() => handleRemoveExercise(exercise.id)}
              onToggleComplete={() => handleToggleComplete(exercise.id)}
            />
          ))
        )}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 0,
  },
  backButton: {
    width: 24,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.offWhite,
    lineHeight: 40,
  },
  addButton: {
    width: 24,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 17,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.offWhite,
    lineHeight: 23,
    textTransform: 'uppercase',
  },
  goalContainer: {
    paddingHorizontal: 35,
    paddingBottom: 16,
  },
  goalLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 12,
    color: colors.yellow,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  goalText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: 'Bebas Neue',
    fontSize: 24,
    color: colors.offWhite,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
    marginTop: 8,
  },
});
