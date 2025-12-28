export type RootStackParamList = {
  Start: undefined;
  Register: undefined;
  CoreProfile: undefined;
  RegisterCoreProfile: undefined;
  RegisterPhysicalInfo: undefined;
  RegisterLocation: undefined;
  RegisterPreferences: undefined;
  RegisterSchedule: { activities: string[] };
  RegisterPreferredDays: { activities: string[] };
  RegisterGoals: undefined;
  RegisterGetStronger: undefined;
  RegisterGetStrongerDetails: undefined;
  RegisterGetFaster: undefined;
  RegisterGetFasterDetails: { goalType: 'sprint' | 'long-distance' | 'both' };
  Weightlifting: undefined;
  WeightliftingEquipment: undefined;
  WeightliftingMaxes: undefined;
  Swimming: undefined;
  SwimmingStyle: undefined;
  SwimmingExample: undefined;
  Pilates: undefined;
  PilatesStudio: undefined;
  Other: undefined;
  AnythingElse: undefined;
};

