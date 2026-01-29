import type {
  LoadSeasonResponse,
  BuildSeasonResponse,
  WorkoutApiError,
  Season,
  DayWorkout,
} from '../types/workout';
import { supabase } from '../config/supabase';

const API_BASE_URL = 'https://offseason.onrender.com';

export const workoutService = {
  loadExistingSeason: async (
    userId: string
  ): Promise<{ success: boolean; season?: Season; error?: string }> => {
    try {
      console.log('workoutService - Loading existing season for user:', userId);

      const response = await fetch(`${API_BASE_URL}/load_existing_season`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as WorkoutApiError;
        console.log('workoutService - Error loading season:', errorData.error);
        return { success: false, error: errorData.error };
      }

      const seasonData = data as LoadSeasonResponse;
      console.log('workoutService - Season loaded successfully');
      return { success: true, season: seasonData.season };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - Exception loading season:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  buildWorkoutSeason: async (
    userId: string,
    overwrite: boolean = false
  ): Promise<{ success: boolean; season?: Season; response?: string; error?: string }> => {
    try {
      console.log('workoutService - Building new season for user:', userId, 'overwrite:', overwrite);

      const response = await fetch(`${API_BASE_URL}/build_workout_season`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, overwrite }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as WorkoutApiError;
        console.log('workoutService - Error building season:', errorData.error);
        return { success: false, error: errorData.error };
      }

      const buildData = data as BuildSeasonResponse;
      console.log('workoutService - Season built successfully');
      return {
        success: true,
        season: buildData.season,
        response: buildData.response,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - Exception building season:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  saveSeason: async (
    userId: string,
    season: Season
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('workoutService - Saving season for user:', userId);

      // Check if user is authenticated with Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('workoutService - Current session user:', sessionData?.session?.user?.id);
      console.log('workoutService - Trying to update for userId:', userId);

      const { error, status } = await supabase
        .from('seasons')
        .update({ workout_season: season })
        .eq('id', userId);

      console.log('workoutService - Update response, status:', status, 'error:', error);

      if (error) {
        console.log('workoutService - Error saving season:', error.message);
        return { success: false, error: error.message };
      }

      console.log('workoutService - Season saved successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - Exception saving season:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateWorkoutDay: async (
    userId: string,
    dayName: string,
    dayWorkout: DayWorkout,
    fullSeason: Season
  ): Promise<{ success: boolean; updatedSeason?: Season; error?: string }> => {
    try {
      console.log('workoutService - Updating workout day:', dayName, 'for user:', userId);

      if (!fullSeason.cycles || fullSeason.cycles.length === 0) {
        return { success: false, error: 'No cycles found in season' };
      }

      const updatedSeason: Season = JSON.parse(JSON.stringify(fullSeason));
      const firstCycle = updatedSeason.cycles[0];

      if (!firstCycle.weeks || firstCycle.weeks.length === 0) {
        return { success: false, error: 'No weeks found in cycle' };
      }

      const firstWeek = firstCycle.weeks[0];
      firstWeek.days[dayName] = dayWorkout;

      const saveResult = await workoutService.saveSeason(userId, updatedSeason);

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      console.log('workoutService - Workout day updated successfully');
      return { success: true, updatedSeason };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - Exception updating workout day:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateExercises: async (
    userId: string,
    dayName: string,
    exercises: DayWorkout['exercises'],
    fullSeason: Season
  ): Promise<{ success: boolean; updatedSeason?: Season; error?: string }> => {
    try {
      console.log('workoutService - Updating exercises for day:', dayName);

      if (!fullSeason.cycles?.[0]?.weeks?.[0]?.days) {
        return { success: false, error: 'Invalid season structure' };
      }

      const updatedSeason: Season = JSON.parse(JSON.stringify(fullSeason));
      const dayWorkout = updatedSeason.cycles[0].weeks[0].days[dayName];

      if (!dayWorkout) {
        return { success: false, error: `Day ${dayName} not found` };
      }

      dayWorkout.exercises = exercises;
      dayWorkout.rest_day = false;

      console.log('workoutService - Exercises to save:', JSON.stringify(exercises, null, 2));

      const saveResult = await workoutService.saveSeason(userId, updatedSeason);

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      console.log('workoutService - Exercises updated successfully');
      return { success: true, updatedSeason };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - Exception updating exercises:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  swapDays: async (
    userId: string,
    dayName1: string,
    dayName2: string,
    fullSeason: Season
  ): Promise<{ success: boolean; updatedSeason?: Season; error?: string }> => {
    try {
      console.log('workoutService - Swapping days:', dayName1, 'and', dayName2);

      if (!fullSeason.cycles?.[0]?.weeks?.[0]?.days) {
        return { success: false, error: 'Invalid season structure' };
      }

      const updatedSeason: Season = JSON.parse(JSON.stringify(fullSeason));
      const days = updatedSeason.cycles[0].weeks[0].days;

      const day1Workout = days[dayName1];
      const day2Workout = days[dayName2];

      days[dayName1] = day2Workout || { rest_day: true };
      days[dayName2] = day1Workout || { rest_day: true };

      const saveResult = await workoutService.saveSeason(userId, updatedSeason);

      if (!saveResult.success) {
        return { success: false, error: saveResult.error };
      }

      console.log('workoutService - Days swapped successfully');
      return { success: true, updatedSeason };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - Exception swapping days:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};
