import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppLoadingScreen, HomeScreen, StartScreen, RegisterScreen, CoreProfileScreen, RegisterCoreProfileScreen, RegisterPhysicalInfoScreen, RegisterLocationScreen, RegisterPreferencesScreen, RegisterScheduleScreen, RegisterPreferredDaysScreen, RegisterGoalsScreen, RegisterGetStrongerScreen, RegisterGetStrongerDetailsScreen, RegisterGetFasterScreen, RegisterGetFasterDetailsScreen, RegisterGainMuscleScreen, RegisterGainMuscleDetailsScreen, RegisterLoseBodyFatScreen, RegisterLoseBodyFatDetailsScreen, RegisterTrainEventScreen, RegisterTrainEventDetailsScreen, RegisterTrainEventTrainingStatusScreen, RegisterTrainEventCurrentStatusScreen, RegisterPushMyselfScreen, RegisterSummaryReviewScreen } from '../screens';
import { WeightliftingScreen, WeightliftingEquipmentScreen, WeightliftingMaxesScreen, SwimmingScreen, SwimmingStyleScreen, SwimmingExampleScreen, PilatesScreen, PilatesStudioScreen, YogaScreen, YogaStudioScreen, RunningScreen, RunningStyleScreen, RunningExampleScreen, RunningDistanceScreen, SportsScreen, SportsTypeScreen, WalkingScreen, WalkingDistanceScreen, OtherScreen, AnythingElseScreen } from '../screens/training';
import { ReferFriendsScreen, AiChatScreen, WorkoutDetailScreen, EditLocationScreen, EditSummaryScreen, EditWorkoutDayScreen } from '../screens/main';
import { LoginScreen, VerifyOTPScreen } from '../screens/auth';
import { RootStackParamList } from '../types/navigation';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AppLoading"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="AppLoading" component={AppLoadingScreen} />
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CoreProfile" component={CoreProfileScreen} />
      <Stack.Screen name="RegisterCoreProfile" component={RegisterCoreProfileScreen} />
      <Stack.Screen name="RegisterPhysicalInfo" component={RegisterPhysicalInfoScreen} />
      <Stack.Screen name="RegisterLocation" component={RegisterLocationScreen} />
      <Stack.Screen name="RegisterPreferences" component={RegisterPreferencesScreen} />
      <Stack.Screen name="RegisterSchedule" component={RegisterScheduleScreen} />
      <Stack.Screen name="RegisterPreferredDays" component={RegisterPreferredDaysScreen} />
      <Stack.Screen name="RegisterGoals" component={RegisterGoalsScreen} />
      <Stack.Screen name="RegisterGetStronger" component={RegisterGetStrongerScreen} />
      <Stack.Screen name="RegisterGetStrongerDetails" component={RegisterGetStrongerDetailsScreen} />
      <Stack.Screen name="RegisterGetFaster" component={RegisterGetFasterScreen} />
      <Stack.Screen name="RegisterGetFasterDetails" component={RegisterGetFasterDetailsScreen} />
      <Stack.Screen name="RegisterGainMuscle" component={RegisterGainMuscleScreen} />
      <Stack.Screen name="RegisterGainMuscleDetails" component={RegisterGainMuscleDetailsScreen} />
      <Stack.Screen name="RegisterLoseBodyFat" component={RegisterLoseBodyFatScreen} />
      <Stack.Screen name="RegisterLoseBodyFatDetails" component={RegisterLoseBodyFatDetailsScreen} />
      <Stack.Screen name="RegisterTrainEvent" component={RegisterTrainEventScreen} />
      <Stack.Screen name="RegisterTrainEventDetails" component={RegisterTrainEventDetailsScreen} />
      <Stack.Screen name="RegisterTrainEventTrainingStatus" component={RegisterTrainEventTrainingStatusScreen} />
      <Stack.Screen name="RegisterTrainEventCurrentStatus" component={RegisterTrainEventCurrentStatusScreen} />
      <Stack.Screen name="RegisterPushMyself" component={RegisterPushMyselfScreen} />
      <Stack.Screen name="RegisterSummaryReview" component={RegisterSummaryReviewScreen} />
      <Stack.Screen name="Weightlifting" component={WeightliftingScreen} />
      <Stack.Screen name="WeightliftingEquipment" component={WeightliftingEquipmentScreen} />
      <Stack.Screen name="WeightliftingMaxes" component={WeightliftingMaxesScreen} />
      <Stack.Screen name="Swimming" component={SwimmingScreen} />
      <Stack.Screen name="SwimmingStyle" component={SwimmingStyleScreen} />
      <Stack.Screen name="SwimmingExample" component={SwimmingExampleScreen} />
      <Stack.Screen name="Pilates" component={PilatesScreen} />
      <Stack.Screen name="PilatesStudio" component={PilatesStudioScreen} />
      <Stack.Screen name="Yoga" component={YogaScreen} />
      <Stack.Screen name="YogaStudio" component={YogaStudioScreen} />
      <Stack.Screen name="Running" component={RunningScreen} />
      <Stack.Screen name="RunningStyle" component={RunningStyleScreen} />
      <Stack.Screen name="RunningExample" component={RunningExampleScreen} />
      <Stack.Screen name="RunningDistance" component={RunningDistanceScreen} />
      <Stack.Screen name="Sports" component={SportsScreen} />
      <Stack.Screen name="SportsType" component={SportsTypeScreen} />
      <Stack.Screen name="Walking" component={WalkingScreen} />
      <Stack.Screen name="WalkingDistance" component={WalkingDistanceScreen} />
      <Stack.Screen name="Other" component={OtherScreen} />
      <Stack.Screen name="AnythingElse" component={AnythingElseScreen} />
      <Stack.Screen name="ReferFriends" component={ReferFriendsScreen} />
      <Stack.Screen
        name="AiChat"
        component={AiChatScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="EditLocation" component={EditLocationScreen} />
      <Stack.Screen name="EditSummary" component={EditSummaryScreen} />
      <Stack.Screen name="EditWorkoutDay" component={EditWorkoutDayScreen} />
    </Stack.Navigator>
  );
};

