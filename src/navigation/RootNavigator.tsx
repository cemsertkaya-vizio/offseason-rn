import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartScreen, RegisterScreen, CoreProfileScreen, RegisterCoreProfileScreen, RegisterPhysicalInfoScreen, RegisterLocationScreen } from '../screens';
import { WeightliftingMaxesScreen, SwimmingScreen, SwimmingStyleScreen, SwimmingExampleScreen, PilatesScreen, PilatesStudioScreen, OtherScreen, AnythingElseScreen } from '../screens/training';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AnythingElse"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CoreProfile" component={CoreProfileScreen} />
      <Stack.Screen name="RegisterCoreProfile" component={RegisterCoreProfileScreen} />
      <Stack.Screen name="RegisterPhysicalInfo" component={RegisterPhysicalInfoScreen} />
      <Stack.Screen name="RegisterLocation" component={RegisterLocationScreen} />
      <Stack.Screen name="WeightliftingMaxes" component={WeightliftingMaxesScreen} />
      <Stack.Screen name="Swimming" component={SwimmingScreen} />
      <Stack.Screen name="SwimmingStyle" component={SwimmingStyleScreen} />
      <Stack.Screen name="SwimmingExample" component={SwimmingExampleScreen} />
      <Stack.Screen name="Pilates" component={PilatesScreen} />
      <Stack.Screen name="PilatesStudio" component={PilatesStudioScreen} />
      <Stack.Screen name="Other" component={OtherScreen} />
      <Stack.Screen name="AnythingElse" component={AnythingElseScreen} />
    </Stack.Navigator>
  );
};

