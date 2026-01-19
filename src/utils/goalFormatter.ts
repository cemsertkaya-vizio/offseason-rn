import type { GoalData } from '../types/auth';
import { getMonthsUntilDate } from './dateUtils';

const EVENT_TYPE_LABELS: Record<string, string> = {
  '5k': '5K',
  '10k': '10K',
  'half-marathon': 'Half Marathon',
  'full-marathon': 'Full Marathon',
  'triathlon': 'Triathlon',
  'iron-man': 'Iron Man',
  'other': 'Event',
};

const PUSH_TYPE_LABELS: Record<string, string> = {
  'consistency': 'Better Consistency',
  'motivation': 'More Motivation',
  'effort': 'More Effort',
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  'get-stronger': 'Get Stronger',
  'get-faster': 'Get Faster',
  'gain-muscle': 'Gain Muscle',
  'lose-fat': 'Lose Body Fat',
  'train-event': 'Train for Event',
  'push-myself': 'Push Myself',
};

export interface FormattedGoal {
  title: string;
  subtitle?: string;
  fullText: string;
}

export const formatGoalForDisplay = (goal: GoalData): FormattedGoal => {
  switch (goal.type) {
    case 'train-event': {
      const eventLabel = goal.eventType 
        ? EVENT_TYPE_LABELS[goal.eventType] || goal.eventType 
        : 'Event';
      
      let subtitle: string | undefined;
      if (goal.eventMonth && goal.eventYear) {
        const monthsOut = getMonthsUntilDate(goal.eventMonth, goal.eventYear);
        if (monthsOut === 0) {
          subtitle = 'This Month';
        } else if (monthsOut === 1) {
          subtitle = '1 Month Out';
        } else {
          subtitle = `${monthsOut} Months Out`;
        }
      }
      
      return {
        title: eventLabel,
        subtitle,
        fullText: subtitle ? `${eventLabel} - ${subtitle}` : eventLabel,
      };
    }
    
    case 'push-myself': {
      const pushLabel = goal.pushType 
        ? PUSH_TYPE_LABELS[goal.pushType] || goal.pushType 
        : undefined;
      
      return {
        title: 'Push Myself',
        subtitle: pushLabel,
        fullText: pushLabel ? `Push Myself - ${pushLabel}` : 'Push Myself',
      };
    }
    
    case 'get-faster': {
      let subtitle: string | undefined;
      if (goal.targetPace) {
        const { minutes, seconds, unit } = goal.targetPace;
        subtitle = `${minutes}:${seconds.toString().padStart(2, '0')} per ${unit}`;
      }
      
      return {
        title: 'Get Faster',
        subtitle,
        fullText: subtitle ? `Get Faster - ${subtitle}` : 'Get Faster',
      };
    }
    
    case 'gain-muscle': {
      let subtitle: string | undefined;
      if (goal.targetMuscleMass) {
        subtitle = `Target: ${goal.targetMuscleMass} lbs`;
      }
      
      return {
        title: 'Gain Muscle',
        subtitle,
        fullText: subtitle ? `Gain Muscle - ${subtitle}` : 'Gain Muscle',
      };
    }
    
    case 'lose-fat': {
      let subtitle: string | undefined;
      if (goal.targetBodyFat) {
        subtitle = `Target: ${goal.targetBodyFat}%`;
      }
      
      return {
        title: 'Lose Body Fat',
        subtitle,
        fullText: subtitle ? `Lose Body Fat - ${subtitle}` : 'Lose Body Fat',
      };
    }
    
    default: {
      const label = GOAL_TYPE_LABELS[goal.type] || goal.type;
      return {
        title: label,
        fullText: label,
      };
    }
  }
};
