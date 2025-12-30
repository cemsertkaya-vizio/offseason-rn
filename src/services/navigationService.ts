import type { ProfileData, User } from '../types/auth';

export type InitialRoute =
  | 'Start'
  | 'RegisterCoreProfile'
  | 'RegisterPhysicalInfo'
  | 'RegisterLocation'
  | 'RegisterPreferences'
  | 'RegisterSchedule'
  | 'RegisterPreferredDays'
  | 'RegisterGoals'
  | 'RegisterSummaryReview'
  | 'Home';

export const navigationService = {
  determineInitialRoute: (user: User | null, profile: ProfileData | null | undefined): InitialRoute => {
    console.log('navigationService - Determining initial route');
    console.log('navigationService - User authenticated:', !!user);
    console.log('navigationService - Profile exists:', !!profile);
    console.log('navigationService - Profile step:', profile?.onboarding_step);
    console.log('navigationService - Registration complete:', !!profile?.registration_completed_at);

    if (!user) {
      console.log('navigationService - Not authenticated, going to Start');
      return 'Start';
    }

    if (!profile) {
      console.log('navigationService - Authenticated but no profile, going to RegisterCoreProfile');
      return 'RegisterCoreProfile';
    }

    if (profile.registration_completed_at) {
      console.log('navigationService - Profile complete, going to Home');
      return 'Home';
    }

    console.log('navigationService - Profile incomplete, resuming at:', profile.onboarding_step);

    switch (profile.onboarding_step) {
      case 'phone_verified':
        return 'RegisterPhysicalInfo';
      case 'physical_info':
        return 'RegisterLocation';
      case 'location':
        return 'RegisterPreferences';
      case 'preferences':
        return 'RegisterSchedule';
      case 'schedule':
        return 'RegisterPreferredDays';
      case 'preferred_days':
        return 'RegisterGoals';
      case 'goals':
      case 'summary':
        return 'RegisterSummaryReview';
      case 'complete':
        return 'Home';
      default:
        console.log('navigationService - Unknown step, defaulting to RegisterPhysicalInfo');
        return 'RegisterPhysicalInfo';
    }
  },

  getOnboardingProgress: (profile: ProfileData | null | undefined): number => {
    if (!profile) return 0;
    if (profile.registration_completed_at) return 100;

    const stepProgress: Record<string, number> = {
      phone_verified: 10,
      physical_info: 25,
      location: 40,
      preferences: 55,
      schedule: 65,
      preferred_days: 75,
      goals: 85,
      summary: 95,
      complete: 100,
    };

    return stepProgress[profile.onboarding_step || 'phone_verified'] || 0;
  },
};

