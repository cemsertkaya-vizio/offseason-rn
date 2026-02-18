import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { WorkoutExerciseCard } from '../../components/WorkoutExerciseCard';
import { RootStackParamList } from '../../types/navigation';
import { useWorkout } from '../../contexts/WorkoutContext';
import { studioService, Studio } from '../../services/studioService';
import { exerciseMediaService, ExerciseMedia } from '../../services/exerciseMediaService';
import type { WorkoutExercise } from '../../types/workout';
import type { ImageSourcePropType } from 'react-native';

type WorkoutDetailRouteProp = RouteProp<RootStackParamList, 'WorkoutDetail'>;

interface DisplayExercise {
  id: string;
  title: string;
  imageSource: ImageSourcePropType;
  videoSource: { uri: string } | null;
  tags: { label: string }[];
  isCompleted: boolean;
  instructions: string[];
  sets: number;
  reps: number;
  weight: number;
}

const getExerciseImage = (exercise: string): number => {
  if (!exercise || typeof exercise !== 'string') {
    return require('../../assets/workouts/workout-outdoor-run.png');
  }
  const name = exercise.toLowerCase();
  
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

interface ExerciseFormData {
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
}

const initialFormData: ExerciseFormData = {
  exercise: '',
  sets: '3',
  reps: '10',
  weight: '0',
};

type EditMode = 'add' | 'weight' | 'sets' | 'reps' | null;

type StudioWorkoutType = 'yoga' | 'pilates' | null;

const getStudioWorkoutType = (workoutTitle: string): StudioWorkoutType => {
  const title = workoutTitle.toLowerCase();
  if (title.includes('yoga')) {
    return 'yoga';
  }
  if (title.includes('pilates')) {
    return 'pilates';
  }
  return null;
};

interface StudioCardImageProps {
  imageUri: string;
  studioWorkoutType: StudioWorkoutType;
  containerStyle: object;
  imageStyle: object;
  placeholderStyle: object;
}

const StudioCardImage: React.FC<StudioCardImageProps> = ({
  imageUri,
  studioWorkoutType,
  containerStyle,
  imageStyle,
  placeholderStyle,
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setStatus(imageUri ? 'loading' : 'error');
  }, [imageUri]);

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => {
    console.log('WorkoutDetailScreen - Studio image failed to load:', imageUri);
    setStatus('error');
  }, [imageUri]);

  if (!imageUri || status === 'error') {
    return (
      <View style={[containerStyle, placeholderStyle]}>
        <Icon2
          name={studioWorkoutType === 'yoga' ? 'yoga' : 'human-handsup'}
          size={40}
          color={colors.offWhite}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri: imageUri }}
        style={imageStyle}
        resizeMode="cover"
        onLoad={handleLoad}
        onError={handleError}
      />
      {status === 'loading' && (
        <View style={[StyleSheet.absoluteFill, placeholderStyle, styles.studioImageLoaderOverlay]}>
          <ActivityIndicator size="small" color={colors.offWhite} />
        </View>
      )}
    </View>
  );
};

export const WorkoutDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<WorkoutDetailRouteProp>();
  const { addExercise, removeExercise, updateExercise, getDayWorkout, isSaving, error: contextError } = useWorkout();

  const { workoutTitle, day, date, duration, exercises: apiExercises, workoutGoal } = route.params;

  const [exercises, setExercises] = useState<DisplayExercise[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [formData, setFormData] = useState<ExerciseFormData>(initialFormData);
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoadingStudios, setIsLoadingStudios] = useState(false);
  const [exerciseMedia, setExerciseMedia] = useState<ExerciseMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  const studioWorkoutType = getStudioWorkoutType(workoutTitle);

  const refreshExercises = useCallback(() => {
    const dayWorkout = getDayWorkout(day);
    const currentExercises = dayWorkout?.exercises || apiExercises || [];
    
    const transformedExercises: DisplayExercise[] = currentExercises.map((exercise, index) => {
      const media = exerciseMediaService.getMediaForExercise(exercise.exercise, exerciseMedia);

      const imageSource: ImageSourcePropType = media?.image_filename
        ? { uri: exerciseMediaService.getImageUrl(media.image_filename) }
        : getExerciseImage(exercise.exercise);

      const videoSource = media?.video_filename
        ? { uri: exerciseMediaService.getVideoUrl(media.video_filename) }
        : null;

      return {
        id: `${index}-${exercise.exercise}`,
        title: exercise.exercise,
        imageSource,
        videoSource,
        tags: formatExerciseTags(exercise.sets, exercise.reps, exercise.weight),
        isCompleted: exercise.completed || false,
        instructions: [],
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
      };
    });
    setExercises(transformedExercises);
  }, [day, getDayWorkout, apiExercises, exerciseMedia]);

  useEffect(() => {
    refreshExercises();
  }, [refreshExercises]);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      const result = await exerciseMediaService.fetchAllExerciseMedia();
      if (result.success && result.data) {
        setExerciseMedia(result.data);
      } else {
        console.log('WorkoutDetailScreen - Failed to load exercise media:', result.error);
      }
      setIsLoadingMedia(false);
    };

    fetchMedia();
  }, []);

  useEffect(() => {
    const fetchStudios = async () => {
      if (!studioWorkoutType) {
        return;
      }
      
      setIsLoadingStudios(true);
      console.log('WorkoutDetailScreen - Fetching studios for:', studioWorkoutType);
      
      const result = await studioService.getStudiosByActivity(studioWorkoutType);
      
      if (result.success && result.studios) {
        setStudios(result.studios);
        console.log('WorkoutDetailScreen - Loaded studios:', result.studios.length);
      } else {
        console.log('WorkoutDetailScreen - Failed to load studios:', result.error);
      }
      
      setIsLoadingStudios(false);
    };

    fetchStudios();
  }, [studioWorkoutType]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddExercise = () => {
    console.log('WorkoutDetailScreen - Add exercise pressed');
    Alert.alert(
      'Coming Soon',
      'Add exercise feature is under development.',
      [{ text: 'OK' }]
    );
  };

  const handleExercisePress = (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Exercise pressed:', exerciseIndex);
    if (expandedIndex === exerciseIndex) {
      setExpandedIndex(null);
      setPlayingVideoIndex(null);
    } else {
      setExpandedIndex(exerciseIndex);
      setPlayingVideoIndex(null);
    }
  };

  const handleEditWeight = (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Edit weight for exercise:', exerciseIndex);
    const exercise = exercises[exerciseIndex];
    if (exercise) {
      setEditingIndex(exerciseIndex);
      setEditMode('weight');
      setFormData(prev => ({ ...prev, weight: exercise.weight.toString() }));
      setIsModalVisible(true);
    }
  };

  const handleEditSets = (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Edit sets for exercise:', exerciseIndex);
    const exercise = exercises[exerciseIndex];
    if (exercise) {
      setEditingIndex(exerciseIndex);
      setEditMode('sets');
      setFormData(prev => ({ ...prev, sets: exercise.sets.toString() }));
      setIsModalVisible(true);
    }
  };

  const handleEditReps = (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Edit reps for exercise:', exerciseIndex);
    const exercise = exercises[exerciseIndex];
    if (exercise) {
      setEditingIndex(exerciseIndex);
      setEditMode('reps');
      setFormData(prev => ({ ...prev, reps: exercise.reps.toString() }));
      setIsModalVisible(true);
    }
  };

  const handleRemoveExercise = async (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Remove exercise:', exerciseIndex);
    
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeExercise(day, exerciseIndex);
            if (success) {
              refreshExercises();
            } else {
              Alert.alert('Error', 'Failed to remove exercise. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = async (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Toggle complete for index:', exerciseIndex);
    const dayWorkout = getDayWorkout(day);
    const currentExercise = dayWorkout?.exercises?.[exerciseIndex];
    
    if (!currentExercise) {
      console.log('WorkoutDetailScreen - Exercise not found at index:', exerciseIndex);
      return;
    }

    const updatedExercise = {
      ...currentExercise,
      completed: !currentExercise.completed,
    };

    console.log('WorkoutDetailScreen - Updated exercise to save:', JSON.stringify(updatedExercise));

    const success = await updateExercise(day, exerciseIndex, updatedExercise);
    if (success) {
      refreshExercises();
    } else {
      Alert.alert('Error', 'Failed to update exercise status.');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingIndex(null);
    setEditMode(null);
    setFormData(initialFormData);
  };

  const handlePlayPress = (exerciseIndex: number) => {
    console.log('WorkoutDetailScreen - Play button pressed for exercise:', exerciseIndex);
    if (playingVideoIndex === exerciseIndex) {
      setPlayingVideoIndex(null);
    } else {
      setPlayingVideoIndex(exerciseIndex);
    }
  };

  const handleSaveExercise = async () => {
    const dayWorkout = getDayWorkout(day);
    console.log('WorkoutDetailScreen - handleSaveExercise, day:', day, 'dayWorkout exists:', !!dayWorkout);
    
    if (editMode === 'add') {
      if (!formData.exercise.trim()) {
        Alert.alert('Error', 'Please enter an exercise name');
        return;
      }

      const exerciseData: WorkoutExercise = {
        exercise: formData.exercise.trim(),
        sets: parseInt(formData.sets, 10) || 1,
        reps: parseInt(formData.reps, 10) || 1,
        weight: parseInt(formData.weight, 10) || 0,
      };

      console.log('WorkoutDetailScreen - Adding new exercise');
      const success = await addExercise(day, exerciseData);

      if (success) {
        handleModalClose();
        refreshExercises();
      } else {
        Alert.alert('Error', 'Failed to add exercise. Please try again.');
      }
      return;
    }

    if (editingIndex === null || !dayWorkout?.exercises?.[editingIndex]) {
      Alert.alert('Error', 'Exercise not found');
      return;
    }

    const currentExercise = dayWorkout.exercises[editingIndex];
    let exerciseData: WorkoutExercise;

    switch (editMode) {
      case 'weight':
        exerciseData = {
          ...currentExercise,
          weight: parseInt(formData.weight, 10) || 0,
        };
        break;
      case 'sets':
        exerciseData = {
          ...currentExercise,
          sets: parseInt(formData.sets, 10) || 1,
        };
        break;
      case 'reps':
        exerciseData = {
          ...currentExercise,
          reps: parseInt(formData.reps, 10) || 1,
        };
        break;
      default:
        return;
    }

    console.log('WorkoutDetailScreen - Updating exercise at index:', editingIndex, 'day:', day);
    const success = await updateExercise(day, editingIndex, exerciseData);

    if (success) {
      handleModalClose();
      refreshExercises();
    } else {
      console.log('WorkoutDetailScreen - Update failed, contextError:', contextError);
      Alert.alert('Error', contextError || 'Failed to update exercise. Please try again.');
    }
  };

  const formatDate = () => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayName = date || '';

    const parsed = new Date(day + 'T00:00:00');
    if (!isNaN(parsed.getTime())) {
      const monthStr = monthNames[parsed.getMonth()];
      const dayNum = parsed.getDate();
      return dayName ? `${dayName}, ${monthStr} ${dayNum}` : `${monthStr} ${dayNum}`;
    }

    return dayName || day;
  };

  const formatDuration = () => {
    if (duration) {
      return `${duration} MIN`;
    }
    return `${exercises.length * 5} MIN`;
  };

  const dayWorkout = getDayWorkout(day);
  const isRestDay = dayWorkout?.rest_day === true;

  const handleOpenStudioUrl = (url: string | null) => {
    const studioUrl = url || 'https://www.example.com';
    const formattedUrl = studioUrl.startsWith('http') ? studioUrl : `https://${studioUrl}`;
    
    console.log('WorkoutDetailScreen - Opening studio URL:', formattedUrl);
    Linking.openURL(formattedUrl).catch((err) => {
      console.log('WorkoutDetailScreen - Error opening URL:', err);
      Alert.alert('Error', 'Unable to open the link');
    });
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

        {!studioWorkoutType && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercise}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="add" size={24} color={colors.offWhite} />
          </TouchableOpacity>
        )}
        {studioWorkoutType && <View style={styles.addButton} />}
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon2 name="calendar-blank" size={13} color={colors.offWhite} />
          <Text style={styles.metaText}>{formatDate()}</Text>
        </View>
        {studioWorkoutType ? (
          <View style={styles.metaItem}>
            <Icon name="open-in-new" size={13} color={colors.offWhite} />
            <Text style={styles.metaText}>REGISTRATION REQUIRED</Text>
          </View>
        ) : (
          <View style={styles.metaItem}>
            <Icon2 name="clock-outline" size={13} color={colors.offWhite} />
            <Text style={styles.metaText}>{formatDuration()}</Text>
          </View>
        )}
      </View>

      {workoutGoal && !studioWorkoutType && (
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
        {studioWorkoutType && (
          <View style={styles.studiosSection}>
            {isLoadingStudios ? (
              <ActivityIndicator size="small" color={colors.offWhite} style={styles.studiosLoader} />
            ) : studios.length > 0 ? (
              studios.map((studio) => (
                <TouchableOpacity 
                  key={studio.id} 
                  style={styles.studioCard}
                  activeOpacity={0.8}
                >
                  <StudioCardImage
                    imageUri={studio.image_url || ''}
                    studioWorkoutType={studioWorkoutType}
                    containerStyle={styles.studioImageContainer}
                    imageStyle={styles.studioImage}
                    placeholderStyle={styles.studioImagePlaceholder}
                  />
                  <View style={styles.studioInfoContainer}>
                    <View style={styles.studioInfoLeft}>
                      <Text style={styles.studioName}>{studio.name}</Text>
                      <View style={styles.studioLocationBadge}>
                        <Text style={styles.studioLocationText}>
                          {[studio.city, studio.location_pill].filter(Boolean).join('-') || 'San Francisco'}
                        </Text>
                      </View>
                      {studio.address ? (
                        <Text style={styles.studioAddressText}>{studio.address}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity 
                      style={styles.studioLinkButton}
                      onPress={() => handleOpenStudioUrl(studio.url)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="open-in-new" size={13} color={colors.offWhite} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noStudiosText}>No studios available in your area</Text>
            )}
          </View>
        )}

        {!studioWorkoutType && isRestDay && exercises.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon2 name="sleep" size={48} color={colors.offWhite} />
            <Text style={styles.emptyText}>Rest Day</Text>
            <Text style={styles.emptySubtext}>Take time to recover and recharge</Text>
          </View>
        )}

        {!studioWorkoutType && !isRestDay && exercises.length === 0 && (
          <View style={styles.emptyWorkoutContainer}>
            {dayWorkout?.priorities && dayWorkout.priorities.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>PRIORITIES</Text>
                <Text style={styles.detailText}>
                  {dayWorkout.priorities.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                </Text>
              </View>
            )}
            {dayWorkout?.reason && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>REASON</Text>
                <Text style={styles.detailText}>{dayWorkout.reason}</Text>
              </View>
            )}
            <View style={styles.emptyExercisesContainer}>
              <Icon2 name="dumbbell" size={40} color={colors.offWhite} />
              <Text style={styles.emptyExercisesText}>No exercises in this workout yet</Text>
              <Text style={styles.emptyExercisesSubtext}>Use the add button to customize</Text>
            </View>
          </View>
        )}

        {!studioWorkoutType && exercises.length > 0 && isLoadingMedia && (
          <View style={styles.exercisesLoaderContainer}>
            <ActivityIndicator size="large" color={colors.offWhite} />
          </View>
        )}

        {!studioWorkoutType && exercises.length > 0 && !isLoadingMedia && (
          exercises.map((exercise, index) => {
            const getActiveAction = () => {
              if (editingIndex !== index || !isModalVisible) return null;
              if (editMode === 'weight') return 'weight';
              if (editMode === 'sets') return 'sets';
              if (editMode === 'reps') return 'reps';
              return null;
            };

            return (
              <WorkoutExerciseCard
                key={exercise.id}
                title={exercise.title}
                imageSource={exercise.imageSource}
                videoSource={exercise.videoSource}
                tags={exercise.tags}
                isCompleted={exercise.isCompleted}
                isExpanded={expandedIndex === index}
                isVideoPlaying={playingVideoIndex === index}
                instructions={exercise.instructions}
                activeAction={getActiveAction()}
                onPress={() => handleExercisePress(index)}
                onPlayPress={() => handlePlayPress(index)}
                onEditWeight={() => handleEditWeight(index)}
                onEditSets={() => handleEditSets(index)}
                onEditReps={() => handleEditReps(index)}
                onToggleComplete={() => handleToggleComplete(index)}
                onDelete={() => handleRemoveExercise(index)}
              />
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          {editMode === 'add' ? (
            <View style={styles.modalContentAdd}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitleAdd}>ADD EXERCISE</Text>
                <TouchableOpacity onPress={handleModalClose}>
                  <Icon name="close" size={24} color={colors.offWhite} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EXERCISE NAME</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.exercise}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, exercise: text }))}
                  placeholder="e.g., Bench Press"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoFocus
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupSmall}>
                  <Text style={styles.formLabel}>SETS</Text>
                  <TextInput
                    style={styles.formInputSmall}
                    value={formData.sets}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, sets: text }))}
                    keyboardType="number-pad"
                    placeholder="3"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                </View>

                <View style={styles.formGroupSmall}>
                  <Text style={styles.formLabel}>REPS</Text>
                  <TextInput
                    style={styles.formInputSmall}
                    value={formData.reps}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, reps: text }))}
                    keyboardType="number-pad"
                    placeholder="10"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                </View>

                <View style={styles.formGroupSmall}>
                  <Text style={styles.formLabel}>WEIGHT (LBS)</Text>
                  <TextInput
                    style={styles.formInputSmall}
                    value={formData.weight}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveExercise}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.darkBrown} />
                ) : (
                  <Text style={styles.saveButtonText}>ADD</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalContentStepper}>
              <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
                <Icon name="close" size={16} color="#1a1a1a" />
              </TouchableOpacity>

              <Text style={styles.stepperTitle}>
                {editingIndex !== null && exercises[editingIndex]?.title} – {editMode === 'weight' ? 'Edit Weight' : editMode === 'sets' ? 'Edit Sets' : 'Edit Reps'}
              </Text>

              <View style={styles.stepperTrack}>
                <TouchableOpacity
                  style={styles.stepperButtonCircle}
                  onPress={() => {
                    const field = editMode as 'weight' | 'sets' | 'reps';
                    const currentValue = parseInt(formData[field], 10) || 0;
                    const newValue = Math.max(editMode === 'weight' ? 0 : 1, currentValue - (editMode === 'weight' ? 5 : 1));
                    setFormData(prev => ({ ...prev, [field]: newValue.toString() }));
                  }}
                >
                  <Icon name="remove" size={18} color="#1a1a1a" />
                </TouchableOpacity>

                <Text style={styles.stepperValue}>
                  {editMode === 'weight' ? formData.weight : editMode === 'sets' ? formData.sets : formData.reps}
                </Text>

                <TouchableOpacity
                  style={styles.stepperButtonCircle}
                  onPress={() => {
                    const field = editMode as 'weight' | 'sets' | 'reps';
                    const currentValue = parseInt(formData[field], 10) || 0;
                    const newValue = currentValue + (editMode === 'weight' ? 5 : 1);
                    setFormData(prev => ({ ...prev, [field]: newValue.toString() }));
                  }}
                >
                  <Icon name="add" size={18} color="#1a1a1a" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveButtonStepper, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveExercise}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.darkBrown} />
                ) : (
                  <Text style={styles.saveButtonTextStepper}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  emptyWorkoutContainer: {
    paddingHorizontal: 35,
    paddingTop: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 12,
    color: colors.yellow,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  detailText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
    marginTop: 2,
  },
  emptyExercisesContainer: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyExercisesText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
    marginTop: 16,
  },
  emptyExercisesSubtext: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentAdd: {
    backgroundColor: colors.darkBrown,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalContentStepper: {
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderWidth: 1.375,
    borderColor: '#1a1a1a',
    borderRadius: 16.5,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitleAdd: {
    fontFamily: 'Bebas Neue',
    fontSize: 24,
    color: colors.offWhite,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  stepperTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#cdcdcd',
    borderRadius: 41,
    borderWidth: 1,
    borderColor: colors.offWhite,
    height: 30,
    width: 165,
    paddingHorizontal: 3,
    marginBottom: 16,
  },
  stepperButtonCircle: {
    width: 38,
    height: 22,
    borderRadius: 33,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2.75,
    elevation: 2,
  },
  stepperValue: {
    fontFamily: 'Bebas Neue',
    fontSize: 26,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  saveButtonStepper: {
    backgroundColor: colors.beige,
    borderWidth: 0.8,
    borderColor: colors.offWhite,
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 11,
    alignItems: 'center',
    width: 183,
  },
  saveButtonTextStepper: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: '#1a1a1a',
  },
  formGroup: {
    marginBottom: 16,
  },
  formGroupSmall: {
    flex: 1,
  },
  formLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 12,
    color: colors.yellow,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Roboto',
    fontSize: 16,
    color: colors.offWhite,
  },
  formInputSmall: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Roboto',
    fontSize: 16,
    color: colors.offWhite,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: colors.yellow,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray.muted,
  },
  saveButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.darkBrown,
  },
  studiosSection: {
    paddingHorizontal: 38,
    paddingBottom: 16,
  },
  studioCard: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.offWhite,
    overflow: 'hidden',
  },
  studioImageContainer: {
    height: 83,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  studioImage: {
    width: '100%',
    height: '100%',
  },
  studioImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studioImageLoaderOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  studioInfoContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 11,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  studioInfoLeft: {
    flex: 1,
  },
  studioLinkButton: {
    marginLeft: 12,
    padding: 4,
  },
  studioName: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  studioLocationBadge: {
    backgroundColor: colors.beige,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  studioLocationText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.darkBrown,
  },
  studioAddressText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.8,
    marginTop: 4,
  },
  studiosLoader: {
    marginVertical: 40,
  },
  exercisesLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  noStudiosText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.6,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
