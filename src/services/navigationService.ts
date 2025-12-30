import type { ProfileData, User } from '../types/auth';
import { activityNavigationService } from './activityNavigationService';

export type InitialRoute =
  | 'Start'
  | 'RegisterCoreProfile'
  | 'RegisterPhysicalInfo'
  | 'RegisterLocation'
  | 'RegisterPreferences'
  | 'RegisterSchedule'
  | 'RegisterPreferredDays'
  | 'Weightlifting'
  | 'Swimming'
  | 'Pilates'
  | 'Other'
  | 'AnythingElse'
  | 'RegisterGoals'
  | 'RegisterSummaryReview'
  | 'Home';

export const navigationService = {
  determineInitialRoute: async (user: User | null, profile: ProfileData | null | undefined): Promise<InitialRoute> => {
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

    const step = profile.onboarding_step;

    switch (step) {
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
      case 'weightlifting_style':
      case 'weightlifting_equipment':
      case 'weightlifting_maxes':
      case 'activity_weightlifting_completed':
      case 'swimming_location':
      case 'swimming_style':
      case 'swimming_example':
      case 'activity_swimming_completed':
      case 'pilates_membership':
      case 'pilates_studio':
      case 'activity_pilates_completed':
      case 'other_activity':
      case 'activity_other_completed':
      case 'anything_else':
        console.log('navigationService - Activity step detected, using activity navigation service');
        const { screen } = await activityNavigationService.getNextActivityScreen(user.id);
        if (screen) {
          console.log('navigationService - Resuming at activity:', screen);
          return screen as InitialRoute;
        }
        console.log('navigationService - All activities complete, going to AnythingElse');
        return 'AnythingElse';
      
      case 'anything_else_complete':
        console.log('navigationService - AnythingElse completed, going to RegisterGoals');
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

    const step = profile.onboarding_step || 'phone_verified';

    const stepProgress: Record<string, number> = {
      phone_verified: 10,
      physical_info: 25,
      location: 40,
      preferences: 55,
      schedule: 65,
      preferred_days: 70,
      weightlifting_style: 72,
      weightlifting_equipment: 74,
      weightlifting_maxes: 76,
      activity_weightlifting_completed: 76,
      swimming_location: 72,
      swimming_style: 74,
      swimming_example: 76,
      activity_swimming_completed: 76,
      pilates_membership: 72,
      pilates_studio: 74,
      activity_pilates_completed: 76,
      other_activity: 72,
      activity_other_completed: 76,
      anything_else: 78,
      anything_else_complete: 80,
      goals: 85,
      summary: 95,
      complete: 100,
    };

    return stepProgress[step] || 0;
  },
};

