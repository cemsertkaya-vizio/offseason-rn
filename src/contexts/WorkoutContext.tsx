import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { workoutService } from '../services/workoutService';
import type { Season, DayWorkout, WorkoutExercise } from '../types/workout';

interface WorkoutContextType {
  season: Season | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refreshSeason: () => Promise<void>;
  updateDay: (dayName: string, dayWorkout: DayWorkout) => Promise<boolean>;
  toggleRestDay: (dayName: string, isRestDay: boolean) => Promise<boolean>;
  updateExercises: (dayName: string, exercises: WorkoutExercise[]) => Promise<boolean>;
  addExercise: (dayName: string, exercise: WorkoutExercise) => Promise<boolean>;
  removeExercise: (dayName: string, exerciseIndex: number) => Promise<boolean>;
  updateExercise: (dayName: string, exerciseIndex: number, exercise: WorkoutExercise) => Promise<boolean>;
  getDayWorkout: (dayName: string) => DayWorkout | undefined;
  swapDays: (dayName1: string, dayName2: string, weekIndex?: number) => Promise<boolean>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [season, setSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeason = useCallback(async () => {
    if (!user?.id) {
      console.log('WorkoutContext - No user ID, skipping season fetch');
      setSeason(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('WorkoutContext - Fetching season for user:', user.id);
      const result = await workoutService.loadExistingSeason(user.id);

      if (result.success && result.season) {
        console.log('WorkoutContext - Season fetched successfully');
        setSeason(result.season);
      } else if (result.error?.includes('No season found')) {
        console.log('WorkoutContext - No existing season found, waiting for registration to complete');
        setSeason(null);
      } else {
        console.log('WorkoutContext - Failed to fetch season:', result.error);
        setError(result.error || 'Failed to fetch season');
        setSeason(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('WorkoutContext - Exception fetching season:', errorMessage);
      setError(errorMessage);
      setSeason(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSeason();
    } else {
      setSeason(null);
      setError(null);
    }
  }, [isAuthenticated, user?.id, fetchSeason]);

  const refreshSeason = useCallback(async () => {
    console.log('WorkoutContext - Refreshing season');
    await fetchSeason();
  }, [fetchSeason]);

  const getDayWorkout = useCallback((dayName: string): DayWorkout | undefined => {
    if (!season?.cycles?.[0]?.weeks?.[0]?.days) {
      return undefined;
    }
    return season.cycles[0].weeks[0].days[dayName];
  }, [season]);

  const updateDay = useCallback(async (dayName: string, dayWorkout: DayWorkout): Promise<boolean> => {
    if (!user?.id || !season) {
      console.log('WorkoutContext - Cannot update day, missing user or season');
      return false;
    }

    setIsSaving(true);
    console.log('WorkoutContext - Updating day:', dayName);

    try {
      const result = await workoutService.updateWorkoutDay(user.id, dayName, dayWorkout, season);

      if (result.success && result.updatedSeason) {
        console.log('WorkoutContext - Day updated successfully');
        setSeason(result.updatedSeason);
        setIsSaving(false);
        return true;
      } else {
        console.log('WorkoutContext - Failed to update day:', result.error);
        setError(result.error || 'Failed to update day');
        setIsSaving(false);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('WorkoutContext - Exception updating day:', errorMessage);
      setError(errorMessage);
      setIsSaving(false);
      return false;
    }
  }, [user?.id, season]);

  const toggleRestDay = useCallback(async (dayName: string, isRestDay: boolean): Promise<boolean> => {
    const currentDay = getDayWorkout(dayName);
    
    const updatedDay: DayWorkout = isRestDay
      ? { rest_day: true }
      : {
          name: currentDay?.name || 'Workout',
          goal: currentDay?.goal || '',
          exercises: currentDay?.exercises || [],
          rest_day: false,
        };

    return updateDay(dayName, updatedDay);
  }, [getDayWorkout, updateDay]);

  const updateExercises = useCallback(async (dayName: string, exercises: WorkoutExercise[]): Promise<boolean> => {
    console.log('WorkoutContext - updateExercises called, user:', user?.id, 'season exists:', !!season);
    
    if (!user?.id) {
      console.log('WorkoutContext - Cannot update exercises, missing user ID');
      setError('User not authenticated');
      return false;
    }
    
    if (!season) {
      console.log('WorkoutContext - Cannot update exercises, season is null');
      setError('Workout data not loaded');
      return false;
    }

    setIsSaving(true);
    console.log('WorkoutContext - Updating exercises for day:', dayName, 'exercises count:', exercises.length);

    try {
      const result = await workoutService.updateExercises(user.id, dayName, exercises, season);

      if (result.success && result.updatedSeason) {
        console.log('WorkoutContext - Exercises updated successfully');
        setSeason(result.updatedSeason);
        setIsSaving(false);
        return true;
      } else {
        console.log('WorkoutContext - Failed to update exercises:', result.error);
        setError(result.error || 'Failed to update exercises');
        setIsSaving(false);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('WorkoutContext - Exception updating exercises:', errorMessage);
      setError(errorMessage);
      setIsSaving(false);
      return false;
    }
  }, [user?.id, season]);

  const addExercise = useCallback(async (dayName: string, exercise: WorkoutExercise): Promise<boolean> => {
    const currentDay = getDayWorkout(dayName);
    const currentExercises = currentDay?.exercises || [];
    const updatedExercises = [...currentExercises, exercise];
    return updateExercises(dayName, updatedExercises);
  }, [getDayWorkout, updateExercises]);

  const removeExercise = useCallback(async (dayName: string, exerciseIndex: number): Promise<boolean> => {
    const currentDay = getDayWorkout(dayName);
    const currentExercises = currentDay?.exercises || [];
    
    if (exerciseIndex < 0 || exerciseIndex >= currentExercises.length) {
      console.log('WorkoutContext - Invalid exercise index:', exerciseIndex);
      return false;
    }

    const updatedExercises = currentExercises.filter((_, index) => index !== exerciseIndex);
    return updateExercises(dayName, updatedExercises);
  }, [getDayWorkout, updateExercises]);

  const updateExercise = useCallback(async (
    dayName: string,
    exerciseIndex: number,
    exercise: WorkoutExercise
  ): Promise<boolean> => {
    console.log('WorkoutContext - updateExercise called for day:', dayName, 'index:', exerciseIndex);
    const currentDay = getDayWorkout(dayName);
    console.log('WorkoutContext - currentDay exists:', !!currentDay, 'exercises count:', currentDay?.exercises?.length || 0);
    
    const currentExercises = currentDay?.exercises || [];
    
    if (exerciseIndex < 0 || exerciseIndex >= currentExercises.length) {
      console.log('WorkoutContext - Invalid exercise index:', exerciseIndex, 'currentExercises.length:', currentExercises.length);
      setError('Invalid exercise index');
      return false;
    }

    const updatedExercises = [...currentExercises];
    updatedExercises[exerciseIndex] = exercise;
    return updateExercises(dayName, updatedExercises);
  }, [getDayWorkout, updateExercises]);

  const swapDays = useCallback(async (dayName1: string, dayName2: string, weekIndex: number = 0): Promise<boolean> => {
    console.log('WorkoutContext - ===== SWAP DAYS CONTEXT START =====');
    console.log('WorkoutContext - Request to swap:', dayName1, 'with', dayName2, 'in week:', weekIndex);
    console.log('WorkoutContext - User ID:', user?.id);
    console.log('WorkoutContext - Season exists:', !!season);
    
    if (!user?.id || !season) {
      console.log('WorkoutContext - ERROR: Cannot swap days, missing user or season');
      console.log('WorkoutContext - User ID present:', !!user?.id);
      console.log('WorkoutContext - Season present:', !!season);
      return false;
    }

    if (dayName1 === dayName2) {
      console.log('WorkoutContext - ERROR: Cannot swap day with itself');
      return false;
    }

    const day1Before = season.cycles?.[0]?.weeks?.[weekIndex]?.days?.[dayName1];
    const day2Before = season.cycles?.[0]?.weeks?.[weekIndex]?.days?.[dayName2];
    
    console.log('WorkoutContext - Day 1 BEFORE swap:', {
      exists: !!day1Before,
      day_name: day1Before?.day_name,
      name: day1Before?.name,
      rest_day: day1Before?.rest_day,
      exercises_count: day1Before?.exercises?.length || 0
    });
    console.log('WorkoutContext - Day 2 BEFORE swap:', {
      exists: !!day2Before,
      day_name: day2Before?.day_name,
      name: day2Before?.name,
      rest_day: day2Before?.rest_day,
      exercises_count: day2Before?.exercises?.length || 0
    });

    setIsSaving(true);
    console.log('WorkoutContext - Calling workoutService.swapDays...');

    try {
      const result = await workoutService.swapDays(user.id, dayName1, dayName2, season, weekIndex);

      console.log('WorkoutContext - workoutService.swapDays result:', {
        success: result.success,
        hasUpdatedSeason: !!result.updatedSeason,
        error: result.error
      });

      if (result.success && result.updatedSeason) {
        const day1After = result.updatedSeason.cycles?.[0]?.weeks?.[weekIndex]?.days?.[dayName1];
        const day2After = result.updatedSeason.cycles?.[0]?.weeks?.[weekIndex]?.days?.[dayName2];
        
        console.log('WorkoutContext - Day 1 AFTER swap:', {
          day_name: day1After?.day_name,
          name: day1After?.name,
          rest_day: day1After?.rest_day,
          exercises_count: day1After?.exercises?.length || 0
        });
        console.log('WorkoutContext - Day 2 AFTER swap:', {
          day_name: day2After?.day_name,
          name: day2After?.name,
          rest_day: day2After?.rest_day,
          exercises_count: day2After?.exercises?.length || 0
        });
        
        console.log('WorkoutContext - Setting updated season in context');
        setSeason(result.updatedSeason);
        setIsSaving(false);
        console.log('WorkoutContext - Days swapped successfully');
        console.log('WorkoutContext - ===== SWAP DAYS CONTEXT END (SUCCESS) =====');
        return true;
      } else {
        console.log('WorkoutContext - ERROR: Failed to swap days:', result.error);
        setError(result.error || 'Failed to swap days');
        setIsSaving(false);
        console.log('WorkoutContext - ===== SWAP DAYS CONTEXT END (FAILED) =====');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('WorkoutContext - EXCEPTION swapping days:', errorMessage);
      console.log('WorkoutContext - Exception details:', err);
      setError(errorMessage);
      setIsSaving(false);
      console.log('WorkoutContext - ===== SWAP DAYS CONTEXT END (EXCEPTION) =====');
      return false;
    }
  }, [user?.id, season]);

  const value: WorkoutContextType = {
    season,
    isLoading,
    isSaving,
    error,
    refreshSeason,
    updateDay,
    toggleRestDay,
    updateExercises,
    addExercise,
    removeExercise,
    updateExercise,
    getDayWorkout,
    swapDays,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
