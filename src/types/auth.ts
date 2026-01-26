import type { User, Session } from '@supabase/supabase-js';

export type { User, Session };

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode?: string;
  countryCallingCode?: string;
  age: number;
  gender: string;
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  location: string;
  selectedActivities: string[];
  trainingSchedule: Record<string, number | null>;
  preferredDays: Record<string, string[]>;
  goals: GoalData[];
  profileSummary?: string;
}

export interface GoalData {
  type: string;
  details?: string;
  muscleGroups?: string[];
  goalType?: string;
  targetPace?: {
    minutes: number;
    seconds: number;
    unit: string;
  };
  currentMuscleMass?: number | null;
  targetMuscleMass?: number | null;
  currentBodyFat?: number | null;
  targetBodyFat?: number | null;
  eventType?: string;
  eventMonth?: string;
  eventYear?: number;
  trainingStatus?: string;
  currentStatus?: string;
  pushType?: string;
}

export interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age?: number;
  gender?: string;
  height_feet?: number;
  height_inches?: number;
  weight_lbs?: number;
  location?: string;
  selected_activities?: string[];
  training_schedule?: Record<string, number | null>;
  preferred_days?: Record<string, string[]>;
  goals?: GoalData[];
  profile_summary?: string;
  profile_image_url?: string;
  onboarding_step?: string;
  onboarding_data?: Record<string, any>;
  registration_completed_at?: string;
  created_at: string;
  updated_at: string;
}

