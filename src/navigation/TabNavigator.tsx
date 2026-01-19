import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import {
  WorkoutsScreen,
  GoalsScreen,
  AnalyticsScreen,
  ProfileScreen,
} from '../screens/main';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const tabBarIcons = {
  workouts: require('../assets/tabbar/run.png'),
  goals: require('../assets/tabbar/trophy-outline.png'),
  analytics: require('../assets/tabbar/chart-bar.png'),
  profile: require('../assets/tabbar/person-outline.png'),
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const CenterTabIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  return (
    <View style={styles.centerIconContainer}>
      <View style={[styles.centerIcon, focused && styles.centerIconFocused]} />
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleCenterPress = () => {
    console.log('TabNavigator - Center button pressed, opening AI Chat');
    navigation.navigate('AiChat');
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabBarIcons.workouts}
              style={[styles.tabIcon, focused && styles.tabIconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabBarIcons.goals}
              style={[styles.goalsIcon, focused && styles.tabIconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Center"
        component={WorkoutsScreen}
        options={{
          tabBarIcon: ({ focused }) => <CenterTabIcon focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleCenterPress();
          },
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabBarIcons.analytics}
              style={[styles.analyticsIcon, focused && styles.tabIconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={tabBarIcons.profile}
              style={[styles.profileIcon, focused && styles.tabIconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar.background,
    borderTopWidth: 1,
    borderTopColor: colors.offWhite,
    height: 71,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  tabIcon: {
    width: 33,
    height: 33,
  },
  goalsIcon: {
    width: 31,
    height: 31,
  },
  profileIcon: {
    width: 26,
    height: 26,
  },
  analyticsIcon: {
    width: 36,
    height: 30,
  },
  tabIconActive: {
    tintColor: colors.white,
  },
  centerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: colors.offWhite,
    shadowColor: colors.offWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 10,
  },
  centerIconFocused: {
    shadowRadius: 20,
  },
});
