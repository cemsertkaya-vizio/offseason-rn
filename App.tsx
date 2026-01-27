/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { RegistrationProvider } from './src/contexts/RegistrationContext';
import { WorkoutProvider } from './src/contexts/WorkoutContext';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <WorkoutProvider>
            <RegistrationProvider>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" backgroundColor="#8B8B8B" />
                <RootNavigator />
              </NavigationContainer>
            </RegistrationProvider>
          </WorkoutProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
