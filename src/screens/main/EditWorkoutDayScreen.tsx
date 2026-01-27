import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { colors } from '../../constants/colors';
import { useWorkout } from '../../contexts/WorkoutContext';
import type { DayWorkout } from '../../types/workout';

type EditWorkoutDayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditWorkoutDay'
>;

type EditWorkoutDayScreenRouteProp = RouteProp<RootStackParamList, 'EditWorkoutDay'>;

interface EditWorkoutDayScreenProps {
  navigation: EditWorkoutDayScreenNavigationProp;
  route: EditWorkoutDayScreenRouteProp;
}

export const EditWorkoutDayScreen: React.FC<EditWorkoutDayScreenProps> = ({
  navigation,
  route,
}) => {
  const { day, dayWorkout: initialDayWorkout } = route.params;
  const { updateDay, isSaving } = useWorkout();

  const [workoutName, setWorkoutName] = useState('');
  const [workoutGoal, setWorkoutGoal] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initialDayWorkout) {
      console.log('EditWorkoutDayScreen - Pre-filling with existing workout data');
      setWorkoutName(initialDayWorkout.name || '');
      setWorkoutGoal(initialDayWorkout.goal || '');
      setIsRestDay(initialDayWorkout.rest_day || false);
    }
    setIsLoading(false);
  }, [initialDayWorkout]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!isRestDay && !workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    console.log('EditWorkoutDayScreen - Saving workout day:', day);

    const updatedDayWorkout: DayWorkout = isRestDay
      ? { rest_day: true }
      : {
          name: workoutName.trim(),
          goal: workoutGoal.trim(),
          exercises: initialDayWorkout?.exercises || [],
          priorities: initialDayWorkout?.priorities || [],
          reason: initialDayWorkout?.reason || '',
          rest_day: false,
        };

    const success = await updateDay(day, updatedDayWorkout);

    if (success) {
      console.log('EditWorkoutDayScreen - Workout day saved successfully');
      navigation.goBack();
    } else {
      console.log('EditWorkoutDayScreen - Error saving workout day');
      Alert.alert('Error', 'Could not save your changes. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleRestDayToggle = (value: boolean) => {
    setIsRestDay(value);
    if (value) {
      setWorkoutName('');
      setWorkoutGoal('');
    }
  };

  const isSaveDisabled = (!isRestDay && !workoutName.trim()) || isSaving;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach2-background.png')}
      />

      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentInner}>
          <Text style={styles.title}>EDIT {day.toUpperCase()}</Text>
          <Text style={styles.subtitle}>
            Customize your workout for this day or set it as a rest day.
          </Text>

          <View style={styles.restDayContainer}>
            <Text style={styles.restDayLabel}>Rest Day</Text>
            <Switch
              value={isRestDay}
              onValueChange={handleRestDayToggle}
              trackColor={{ false: colors.gray.medium, true: colors.yellow }}
              thumbColor={colors.offWhite}
            />
          </View>

          {!isRestDay && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WORKOUT NAME</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={workoutName}
                    onChangeText={setWorkoutName}
                    placeholder="e.g., Upper Body Strength"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    maxLength={50}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WORKOUT GOAL (OPTIONAL)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={workoutGoal}
                    onChangeText={setWorkoutGoal}
                    placeholder="e.g., Build upper body strength and improve pressing movements"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={200}
                  />
                </View>
              </View>

              {initialDayWorkout?.exercises && initialDayWorkout.exercises.length > 0 && (
                <View style={styles.exercisesSummary}>
                  <Text style={styles.exercisesSummaryLabel}>EXERCISES</Text>
                  <Text style={styles.exercisesSummaryCount}>
                    {initialDayWorkout.exercises.length} exercise{initialDayWorkout.exercises.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.exercisesSummaryHint}>
                    Tap on the workout card to edit individual exercises
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.offWhite} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaveDisabled}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.darkBrown} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  contentInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 19,
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 39,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 32,
  },
  restDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    marginBottom: 24,
  },
  restDayLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 14,
    color: colors.yellow,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
  },
  textInput: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
  },
  multilineInput: {
    minHeight: 80,
  },
  exercisesSummary: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  exercisesSummaryLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 14,
    color: colors.yellow,
    marginBottom: 4,
  },
  exercisesSummaryCount: {
    fontFamily: 'Bebas Neue',
    fontSize: 20,
    color: colors.offWhite,
  },
  exercisesSummaryHint: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray.muted,
  },
  saveButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.darkBrown,
    textTransform: 'uppercase',
  },
});
