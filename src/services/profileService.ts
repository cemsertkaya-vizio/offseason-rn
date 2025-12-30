import { supabase } from '../config/supabase';
import type { RegistrationData, ProfileData } from '../types/auth';

export const profileService = {
  createProfile: async (
    userId: string,
    registrationData: RegistrationData
  ): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    try {
      console.log('profileService - Creating profile for user:', userId);

      const profileData = {
        id: userId,
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
        registration_completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.log('profileService - Error creating profile:', error.message);
        return { success: false, error: error.message };
      }

      console.log('profileService - Profile created successfully');
      return { success: true, profile: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('profileService - Exception creating profile:', errorMessage);
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
};

