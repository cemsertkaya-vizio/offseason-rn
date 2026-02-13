import { supabase } from '../config/supabase';
import type { RegistrationData, ProfileData } from '../types/auth';

const API_BASE_URL = 'https://offseason.onrender.com';

export const profileService = {
  createInitialProfile: async (
    userId: string,
    basicData: { firstName: string; lastName: string; phoneNumber: string }
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Creating initial profile for user:', userId);

      const profileData = {
        id: userId,
        first_name: basicData.firstName,
        last_name: basicData.lastName,
        phone_number: basicData.phoneNumber,
        onboarding_step: 'phone_verified',
        registration_completed_at: null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error creating initial profile:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Initial profile created successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception creating initial profile:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateOnboardingProgress: async (
    userId: string,
    step: string,
    data: Partial<Omit<ProfileData, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Updating onboarding progress for user:', userId, 'Step:', step);

      const updateData = {
        ...data,
        onboarding_step: step,
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error updating onboarding progress:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Onboarding progress updated successfully');
      return { success: true, profile };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception updating onboarding progress:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getOnboardingStatus: async (
    userId: string
  ): Promise<{ success: boolean; step?: string; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Getting onboarding status for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('profileService - No profile found for user');
          return { success: true, step: undefined, profile: undefined };
        }
        console.log('profileService - Error getting onboarding status:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Onboarding status:', data.onboarding_step);
      return { success: true, step: data.onboarding_step, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception getting onboarding status:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  createProfile: async (
    userId: string,
    registrationData: RegistrationData
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Completing profile for user:', userId);

      const profileData = {
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        phone_number: registrationData.phoneNumber,
        age: registrationData.age,
        gender: registrationData.gender,
        height_feet: registrationData.heightFeet,
        height_inches: registrationData.heightInches,
        weight_lbs: registrationData.weightLbs,
        location: registrationData.location,
        selected_activities: registrationData.selectedActivities,
        training_schedule: registrationData.trainingSchedule,
        preferred_days: registrationData.preferredDays,
        goals: registrationData.goals,
        profile_summary: registrationData.profileSummary,
        onboarding_step: 'complete',
        registration_completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error completing profile:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Profile completed successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception completing profile:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getUserProfile: async (userId: string): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('profileService - Error fetching profile:', error.message);
        return { success: false, error: error.message };
      }

      if (!data) {
        console.log('profileService - No profile found');
        return { success: false, error: 'Profile not found' };
      }

      console.log('profileService - Profile fetched successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception fetching profile:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (
    userId: string,
    updates: Partial<Omit<ProfileData, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Updating profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error updating profile:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Profile updated successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception updating profile:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateProfileImage: async (
    userId: string,
    imageUrl: string
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Updating profile image for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_image_url: imageUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error updating profile image:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Profile image updated successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception updating profile image:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  removeProfileImage: async (
    userId: string
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Removing profile image for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_image_url: null })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error removing profile image:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Profile image removed successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception removing profile image:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  getProfileSummary: async (
    userId: string
  ): Promise<{ success: boolean; summary?: string; error?: string }> => {
    try {
      console.log('profileService - Fetching profile summary for user:', userId);

      const response = await fetch(`${API_BASE_URL}/profile_summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('profileService - Error fetching profile summary:', data.error || 'Unknown error');
        return { success: false, error: data.error || 'Failed to fetch profile summary' };
      }

      console.log('profileService - Profile summary fetched successfully');
      return { success: true, summary: data.summary };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception fetching profile summary:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};

