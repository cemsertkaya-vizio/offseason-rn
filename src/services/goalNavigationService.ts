import { profileService } from './profileService';

type GoalScreenMap = {
  [key: string]: string;
};

const GOAL_SCREEN_MAP: GoalScreenMap = {
  'get-stronger': 'RegisterGetStronger',
  'get-faster': 'RegisterGetFaster',
  'gain-muscle': 'RegisterGainMuscle',
  'lose-fat': 'RegisterLoseBodyFat',
  'train-event': 'RegisterTrainEvent',
};

export const goalNavigationService = {
  GOAL_SCREEN_MAP,

  getGoalsWithScreens(selectedGoals: string[]): string[] {
    return selectedGoals.filter((goal) => goal in this.GOAL_SCREEN_MAP);
  },

  async getNextGoalScreen(
    userId: string,
    currentGoal?: string
  ): Promise<{ screen: string | null; goal: string | null }> {
    try {
      console.log('goalNavigationService - Getting next goal screen for user:', userId);
      console.log('goalNavigationService - Current goal:', currentGoal);

      const result = await profileService.getOnboardingStatus(userId);

      if (!result.success || !result.profile) {
        console.log('goalNavigationService - Could not load profile');
        return { screen: null, goal: null };
      }

      const onboardingData = result.profile.onboarding_data || {};
      const selectedGoals = (onboardingData.selected_goals as string[]) || [];
      const completedGoals = (onboardingData._completed_goals as string[]) || [];

      console.log('goalNavigationService - Selected goals:', selectedGoals);
      console.log('goalNavigationService - Completed goals:', completedGoals);

      const goalsWithScreens = this.getGoalsWithScreens(selectedGoals);
      console.log('goalNavigationService - Goals with screens:', goalsWithScreens);

      const incompleteGoals = goalsWithScreens.filter(
        (goal) => !completedGoals.includes(goal)
      );

      console.log('goalNavigationService - Incomplete goals:', incompleteGoals);

      if (incompleteGoals.length === 0) {
        console.log('goalNavigationService - All goals completed');
        return { screen: null, goal: null };
      }

      const nextGoal = incompleteGoals[0];
      const nextScreen = this.GOAL_SCREEN_MAP[nextGoal];

      console.log('goalNavigationService - Next goal:', nextGoal);
      console.log('goalNavigationService - Next screen:', nextScreen);

      return { screen: nextScreen, goal: nextGoal };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('goalNavigationService - Error getting next goal:', errorMessage);
      return { screen: null, goal: null };
    }
  },

  async markGoalCompleted(userId: string, goal: string): Promise<boolean> {
    try {
      console.log('goalNavigationService - Marking goal as completed:', goal);

      const result = await profileService.getOnboardingStatus(userId);

      if (!result.success || !result.profile) {
        console.log('goalNavigationService - Could not load profile');
        return false;
      }

      const existingData = result.profile.onboarding_data || {};
      const completedGoals = (existingData._completed_goals as string[]) || [];

      if (completedGoals.includes(goal)) {
        console.log('goalNavigationService - Goal already marked as completed');
        return true;
      }

      const updatedCompletedGoals = [...completedGoals, goal];

      const updatedData = {
        ...existingData,
        _completed_goals: updatedCompletedGoals,
      };

      const saveResult = await profileService.updateOnboardingProgress(
        userId,
        `goal_${goal.replace('-', '_')}_completed`,
        { onboarding_data: updatedData }
      );

      if (saveResult.success) {
        console.log('goalNavigationService - Goal marked as completed successfully');
        return true;
      } else {
        console.log('goalNavigationService - Error marking goal as completed:', saveResult.error);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('goalNavigationService - Exception marking goal as completed:', errorMessage);
      return false;
    }
  },

  async getSimpleGoals(userId: string): Promise<string[]> {
    try {
      const result = await profileService.getOnboardingStatus(userId);

      if (!result.success || !result.profile) {
        return [];
      }

      const onboardingData = result.profile.onboarding_data || {};
      const selectedGoals = (onboardingData.selected_goals as string[]) || [];

      const simpleGoals = selectedGoals.filter((goal) => !(goal in this.GOAL_SCREEN_MAP));

      console.log('goalNavigationService - Simple goals (without screens):', simpleGoals);
      return simpleGoals;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('goalNavigationService - Error getting simple goals:', errorMessage);
      return [];
    }
  },
};

