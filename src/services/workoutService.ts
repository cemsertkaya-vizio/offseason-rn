import type {
  LoadSeasonResponse,
  BuildSeasonResponse,
  WorkoutApiError,
  Season,
} from '../types/workout';

const API_BASE_URL = 'https://offseason.onrender.com';
const SAMPLE_USER_ID = '14e633f3-6837-41e6-b95d-6da409963eea';

export const workoutService = {
  loadExistingSeason: async (
    userId: string = SAMPLE_USER_ID
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
    userId: string = SAMPLE_USER_ID
  ): Promise<{ success: boolean; season?: Season; response?: string; error?: string }> => {
    try {
      console.log('workoutService - Building new season for user:', userId);

      const response = await fetch(`${API_BASE_URL}/build_workout_season`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
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
};
