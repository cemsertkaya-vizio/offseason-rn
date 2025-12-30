import { profileService } from './profileService';

type ActivityScreenMap = {
  [key: string]: string;
};

const ACTIVITY_SCREEN_MAP: ActivityScreenMap = {
  'Weightlifting': 'Weightlifting',
  'Swimming': 'Swimming',
  'Pilates': 'Pilates',
  'Running': 'Running',
  'Other': 'Other',
};

export const activityNavigationService = {
  ACTIVITY_SCREEN_MAP,

  getActivitiesWithScreens(selectedActivities: string[]): string[] {
    return selectedActivities.filter((activity) => activity in this.ACTIVITY_SCREEN_MAP);
  },

  async getNextActivityScreen(
    userId: string,
    currentActivity?: string
  ): Promise<{ screen: string | null; activity: string | null }> {
    try {
      console.log('activityNavigationService - Getting next activity screen for user:', userId);
      console.log('activityNavigationService - Current activity:', currentActivity);

      const result = await profileService.getOnboardingStatus(userId);

      if (!result.success || !result.profile) {
        console.log('activityNavigationService - Could not load profile');
        return { screen: null, activity: null };
      }

      const selectedActivities = result.profile.selected_activities || [];
      const completedActivities =
        (result.profile.onboarding_data?._completed_activities as string[]) || [];

      console.log('activityNavigationService - Selected activities:', selectedActivities);
      console.log('activityNavigationService - Completed activities:', completedActivities);

      const activitiesWithScreens = this.getActivitiesWithScreens(selectedActivities);
      console.log('activityNavigationService - Activities with screens:', activitiesWithScreens);

      const incompleteActivities = activitiesWithScreens.filter(
        (activity) => !completedActivities.includes(activity)
      );

      console.log('activityNavigationService - Incomplete activities:', incompleteActivities);

      if (incompleteActivities.length === 0) {
        console.log('activityNavigationService - All activities completed');
        return { screen: null, activity: null };
      }

      const nextActivity = incompleteActivities[0];
      const nextScreen = this.ACTIVITY_SCREEN_MAP[nextActivity];

      console.log('activityNavigationService - Next activity:', nextActivity);
      console.log('activityNavigationService - Next screen:', nextScreen);

      return { screen: nextScreen, activity: nextActivity };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('activityNavigationService - Error getting next activity:', errorMessage);
      return { screen: null, activity: null };
    }
  },

  async markActivityCompleted(userId: string, activity: string): Promise<boolean> {
    try {
      console.log('activityNavigationService - Marking activity as completed:', activity);

      const result = await profileService.getOnboardingStatus(userId);

      if (!result.success || !result.profile) {
        console.log('activityNavigationService - Could not load profile');
        return false;
      }

      const existingData = result.profile.onboarding_data || {};
      const completedActivities = (existingData._completed_activities as string[]) || [];

      if (completedActivities.includes(activity)) {
        console.log('activityNavigationService - Activity already marked as completed');
        return true;
      }

      const updatedCompletedActivities = [...completedActivities, activity];

      const updatedData = {
        ...existingData,
        _completed_activities: updatedCompletedActivities,
      };

      const saveResult = await profileService.updateOnboardingProgress(
        userId,
        `activity_${activity.toLowerCase()}_completed`,
        { onboarding_data: updatedData }
      );

      if (saveResult.success) {
        console.log('activityNavigationService - Activity marked as completed successfully');
        return true;
      } else {
        console.log('activityNavigationService - Error marking activity as completed:', saveResult.error);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('activityNavigationService - Exception marking activity as completed:', errorMessage);
      return false;
    }
  },
};

