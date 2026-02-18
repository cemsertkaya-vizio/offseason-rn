export interface WorkoutExercise {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface DayWorkout {
  day_name?: string;
  name?: string;
  goal?: string;
  priorities?: string[];
  reason?: string;
  exercises?: WorkoutExercise[];
  rest_day?: boolean;
}

export interface Week {
  goal: string;
  priorities: string[];
  reason: string;
  days: Record<string, DayWorkout>;
}

export interface Cycle {
  goal: string;
  priorities: string[];
  reason: string;
  weeks: Week[];
}

export interface Season {
  goal: string;
  priorities: string[];
  cycles: Cycle[];
}

export interface LoadSeasonResponse {
  season: Season;
}

export interface BuildSeasonResponse {
  response: string;
  season: Season;
}

export interface WorkoutApiError {
  error: string;
}
