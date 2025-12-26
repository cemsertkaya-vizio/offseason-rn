import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartScreen, RegisterScreen, CoreProfileScreen, RegisterCoreProfileScreen, RegisterPhysicalInfoScreen, RegisterLocationScreen } from '../screens';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CoreProfile" component={CoreProfileScreen} />
      <Stack.Screen name="RegisterCoreProfile" component={RegisterCoreProfileScreen} />
      <Stack.Screen name="RegisterPhysicalInfo" component={RegisterPhysicalInfoScreen} />
      <Stack.Screen name="RegisterLocation" component={RegisterLocationScreen} />
    </Stack.Navigator>
  );
};

