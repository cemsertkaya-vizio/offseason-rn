import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { profileService } from '../services/profileService';
import type { ProfileData } from '../types/auth';

interface ProfileContextType {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      console.log('ProfileContext - No user ID, skipping profile fetch');
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('ProfileContext - Fetching profile for user:', user.id);
      const result = await profileService.getUserProfile(user.id);

      if (result.success && result.profile) {
        console.log('ProfileContext - Profile fetched successfully');
        setProfile(result.profile);
      } else {
        console.log('ProfileContext - Failed to fetch profile:', result.error);
        setError(result.error || 'Failed to fetch profile');
        setProfile(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.log('ProfileContext - Exception fetching profile:', errorMessage);
      setError(errorMessage);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [isAuthenticated, user?.id, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    console.log('ProfileContext - Refreshing profile');
    await fetchProfile();
  }, [fetchProfile]);

  const value: ProfileContextType = {
    profile,
    isLoading,
    error,
    refreshProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
