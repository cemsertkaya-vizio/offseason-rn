import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../constants/colors';
import {
  WorkoutsScreen,
  GoalsScreen,
  AnalyticsScreen,
  ProfileScreen,
} from '../screens/main';
import { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CenterTabIcon: React.FC<{ focused: boolean }> = ({ focused }) => {
  return (
    <View style={styles.centerIconContainer}>
      <View style={[styles.centerIcon, focused && styles.centerIconFocused]} />
    </View>
  );
};

export const TabNavigator: React.FC = () => {
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="run" size={33} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="trophy-outline" size={31} color={color} />
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
            console.log('TabNavigator - Center button pressed');
          },
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon2 name="person-outline" size={30} color={color} />
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
