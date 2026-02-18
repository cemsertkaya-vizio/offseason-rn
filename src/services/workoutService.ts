import type {
  LoadSeasonResponse,
  BuildSeasonResponse,
  WorkoutApiError,
  Season,
  DayWorkout,
  WorkoutExercise,
} from '../types/workout';
import { supabase } from '../config/supabase';

const API_BASE_URL = 'https://offseason.onrender.com';

const normalizeExercise = (ex: WorkoutExercise & { name?: string }): WorkoutExercise => ({
  exercise: ex.exercise ?? ex.name ?? '',
  sets: ex.sets,
  reps: ex.reps,
  weight: ex.weight,
  completed: ex.completed,
});

const normalizeSeasonExercises = (season: Season): Season => {
  const normalized = JSON.parse(JSON.stringify(season)) as Season;
  normalized.cycles?.forEach((cycle) =>
    cycle.weeks?.forEach((week) =>
      Object.values(week.days || {}).forEach((day) => {
        if (day?.exercises) {
          day.exercises = day.exercises.map(normalizeExercise);
        }
      })
    )
  );
  return normalized;
};

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
      return {
        success: true,
        season: seasonData.season ? normalizeSeasonExercises(seasonData.season) : undefined,
      };
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
        season: buildData.season ? normalizeSeasonExercises(buildData.season) : undefined,
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
    fullSeason: Season,
    weekIndex: number = 0
  ): Promise<{ success: boolean; updatedSeason?: Season; error?: string }> => {
    try {
      console.log('workoutService - ===== SWAP DAYS START =====');
      console.log('workoutService - Swapping days:', dayName1, 'and', dayName2, 'in week:', weekIndex);
      console.log('workoutService - User ID:', userId);

      if (!fullSeason.cycles?.[0]?.weeks?.[weekIndex]?.days) {
        console.log('workoutService - ERROR: Invalid season structure or week not found');
        return { success: false, error: 'Invalid season structure or week not found' };
      }

      const updatedSeason: Season = JSON.parse(JSON.stringify(fullSeason));
      const days = updatedSeason.cycles[0].weeks[weekIndex].days;
      
      console.log('workoutService - Available days in week:', Object.keys(days));

      const day1Workout = days[dayName1];
      const day2Workout = days[dayName2];

      console.log('workoutService - Day 1 found:', !!day1Workout);
      console.log('workoutService - Day 2 found:', !!day2Workout);

      if (!day1Workout || !day2Workout) {
        console.log('workoutService - ERROR: One or both days not found');
        return { success: false, error: 'One or both days not found' };
      }

      console.log('workoutService - BEFORE SWAP:');
      console.log('workoutService - Day 1 (' + dayName1 + '):', {
        day_name: day1Workout.day_name,
        name: day1Workout.name,
        goal: day1Workout.goal,
        rest_day: day1Workout.rest_day,
        exercises_count: day1Workout.exercises?.length || 0
      });
      console.log('workoutService - Day 2 (' + dayName2 + '):', {
        day_name: day2Workout.day_name,
        name: day2Workout.name,
        goal: day2Workout.goal,
        rest_day: day2Workout.rest_day,
        exercises_count: day2Workout.exercises?.length || 0
      });

      const day1DayName = day1Workout.day_name;
      const day2DayName = day2Workout.day_name;

      console.log('workoutService - Preserving day_name values:', day1DayName, day2DayName);
      console.log('workoutService - Swapping entire day objects...');

      const tempDay = { ...day1Workout };
      
      days[dayName1] = { ...day2Workout, day_name: day1DayName };
      days[dayName2] = { ...tempDay, day_name: day2DayName };

      console.log('workoutService - Swap complete, verifying...');
      console.log('workoutService - days[' + dayName1 + ']:', {
        day_name: days[dayName1].day_name,
        name: days[dayName1].name,
        rest_day: days[dayName1].rest_day
      });
      console.log('workoutService - days[' + dayName2 + ']:', {
        day_name: days[dayName2].day_name,
        name: days[dayName2].name,
        rest_day: days[dayName2].rest_day
      });

      console.log('workoutService - AFTER SWAP:');
      console.log('workoutService - Day 1 (' + dayName1 + '):', {
        day_name: day1Workout.day_name,
        name: day1Workout.name,
        goal: day1Workout.goal,
        rest_day: day1Workout.rest_day,
        exercises_count: day1Workout.exercises?.length || 0
      });
      console.log('workoutService - Day 2 (' + dayName2 + '):', {
        day_name: day2Workout.day_name,
        name: day2Workout.name,
        goal: day2Workout.goal,
        rest_day: day2Workout.rest_day,
        exercises_count: day2Workout.exercises?.length || 0
      });

      console.log('workoutService - Saving updated season to database...');
      const saveResult = await workoutService.saveSeason(userId, updatedSeason);

      if (!saveResult.success) {
        console.log('workoutService - ERROR: Failed to save season:', saveResult.error);
        return { success: false, error: saveResult.error };
      }

      console.log('workoutService - Days swapped and saved successfully');
      console.log('workoutService - ===== SWAP DAYS END =====');
      return { success: true, updatedSeason };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('workoutService - EXCEPTION swapping days:', errorMessage);
      console.log('workoutService - Exception stack:', error);
      return { success: false, error: errorMessage };
    }
  },
};
