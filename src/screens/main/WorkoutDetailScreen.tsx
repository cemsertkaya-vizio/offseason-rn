import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutExerciseCard } from '../../components/WorkoutExerciseCard';
import { RootStackParamList } from '../../types/navigation';

type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

interface Exercise {
  id: string;
  title: string;
  imageSource: number;
  tags: { label: string }[];
  isCompleted: boolean;
}

export const WorkoutDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<WorkoutDetailRouteProp>();

  const { workoutTitle, day, date, duration } = route.params;

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      title: 'Outdoor Run',
      imageSource: require('../../assets/workouts/workout-outdoor-run.png'),
      tags: [{ label: '3 miles' }, { label: 'Conversational pace' }],
      isCompleted: false,
    },
  ]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddExercise = () => {
    console.log('WorkoutDetailScreen - Add exercise pressed');
  };

  const handleExercisePress = (exerciseId: string) => {
    console.log('WorkoutDetailScreen - Exercise pressed:', exerciseId);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exerciseId));
    console.log('WorkoutDetailScreen - Remove exercise:', exerciseId);
  };

  const handleToggleComplete = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(e =>
        e.id === exerciseId ? { ...e, isCompleted: !e.isCompleted } : e,
      ),
    );
    console.log('WorkoutDetailScreen - Toggle complete:', exerciseId);
  };

  const formatDate = () => {
    if (date) {
      return date;
    }
    return `${day}, AUG 22`;
  };

  const formatDuration = () => {
    if (duration) {
      return `${duration} MIN`;
    }
    return '40 MIN';
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map(exercise => (
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
        ))}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 0,
  },
  backButton: {
    width: 24,
    height: 24,
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
    lineHeight: 51.2,
  },
  addButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingTop: 0,
    paddingBottom: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
