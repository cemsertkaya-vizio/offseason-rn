import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartScreen, RegisterScreen, CoreProfileScreen, RegisterCoreProfileScreen } from '../screens';
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
    </Stack.Navigator>
  );
};

