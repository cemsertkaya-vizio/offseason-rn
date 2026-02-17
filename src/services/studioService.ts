import { supabase } from '../config/supabase';

export interface Studio {
  id: string;
  name: string;
  activity_type: 'yoga' | 'pilates' | 'both';
  is_active: boolean;
  display_order: number;
  created_at: string;
  url: string | null;
  image_url: string | null;
  logo_url?: string | null;
  city?: string | null;
  address?: string | null;
  location_pill?: string | null;
}

export const studioService = {
  getStudiosByActivity: async (
    activityType: 'yoga' | 'pilates'
  ): Promise<{ success: boolean; studios?: Studio[]; error?: string }> => {
    try {
      console.log(`studioService - Fetching ${activityType} studios`);

      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .or(`activity_type.eq.${activityType},activity_type.eq.both`)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.log('studioService - Error fetching studios:', error.message);
        return { success: false, error: error.message };
      }

      console.log(`studioService - Fetched ${data?.length || 0} studios`);
      return { success: true, studios: data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('studioService - Exception fetching studios:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getAllStudios: async (): Promise<{ success: boolean; studios?: Studio[]; error?: string }> => {
    try {
      console.log('studioService - Fetching all studios');

      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.log('studioService - Error fetching all studios:', error.message);
        return { success: false, error: error.message };
      }

      console.log(`studioService - Fetched ${data?.length || 0} studios`);
      return { success: true, studios: data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('studioService - Exception fetching all studios:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};

