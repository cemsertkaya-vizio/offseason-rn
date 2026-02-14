import { supabase } from '../config/supabase';

const VIDEO_BUCKET = 'exercise-videos';
const IMAGE_BUCKET = 'exercise-images';

export interface ExerciseMedia {
  id: string;
  exercise_name: string;
  video_filename: string | null;
  image_filename: string | null;
  created_at: string;
  updated_at: string;
}

interface FetchResult {
  success: boolean;
  data?: ExerciseMedia[];
  error?: string;
}

export const exerciseMediaService = {
  fetchAllExerciseMedia: async (): Promise<FetchResult> => {
    try {
      console.log('exerciseMediaService - Fetching all exercise media');

      const { data, error } = await supabase
        .from('exercise_media')
        .select('*');

      if (error) {
        console.log('exerciseMediaService - Fetch error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('exerciseMediaService - Fetched media count:', data?.length ?? 0);
      return { success: true, data: data as ExerciseMedia[] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('exerciseMediaService - Exception fetching media:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getVideoUrl: (videoFilename: string): string => {
    const { data } = supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(videoFilename);
    return data.publicUrl;
  },

  getImageUrl: (imageFilename: string): string => {
    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(imageFilename);
    return data.publicUrl;
  },

  getMediaForExercise: (
    exerciseName: string,
    allMedia: ExerciseMedia[]
  ): ExerciseMedia | undefined => {
    const normalizedName = exerciseName.trim().toLowerCase();
    return allMedia.find(
      (media) => media.exercise_name.trim().toLowerCase() === normalizedName
    );
  },
};
