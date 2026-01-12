import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { authService } from '../../services/authService';
import { RootStackParamList } from '../../types/navigation';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await authService.signOut();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Start' }],
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account</Text>
      
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
    marginBottom: 40,
  },
  signOutButton: {
    backgroundColor: colors.beige,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  signOutText: {
    color: colors.darkBrown,
    fontSize: 16,
    fontWeight: '600',
  },
});
