import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

export const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>View your progress</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.offWhite,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: colors.offWhite,
    opacity: 0.8,
  },
});
