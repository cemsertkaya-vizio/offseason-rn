import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { colors } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGetStrongerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGetStronger'
>;

interface RegisterGetStrongerScreenProps {
  navigation: RegisterGetStrongerScreenNavigationProp;
}

const MUSCLE_GROUP_OPTIONS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'legs', label: 'Legs' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'core', label: 'Core' },
  { id: 'full-body', label: 'Full body' },
];

export const RegisterGetStrongerScreen: React.FC<RegisterGetStrongerScreenProps> = ({
  navigation,
}) => {
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterGetStrongerScreen - Next pressed with muscle groups:', selectedMuscleGroups);
    const selectedLabels = MUSCLE_GROUP_OPTIONS
      .filter((opt) => selectedMuscleGroups.includes(opt.id))
      .map((opt) => opt.label);
    console.log('RegisterGetStrongerScreen - Selected muscle group labels:', selectedLabels);
    navigation.navigate('RegisterGetStrongerDetails');
  };

  const toggleMuscleGroup = (groupId: string) => {
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      }
      return [...prev, groupId];
    });
  };

  const isNextDisabled = selectedMuscleGroups.length === 0;

  const leftColumn = MUSCLE_GROUP_OPTIONS.filter((_, index) => index % 2 === 0);
  const rightColumn = MUSCLE_GROUP_OPTIONS.filter((_, index) => index % 2 === 1);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-get-stronger.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', colors.darkBrown]}
          locations={[0, 0.9454]}
          style={styles.gradient}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>GET STRONGER</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          What do you want to get stronger?
        </Text>

        <View style={styles.optionsContainer}>
          <View style={styles.column}>
            {leftColumn.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.optionButton,
                  selectedMuscleGroups.includes(group.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleMuscleGroup(group.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMuscleGroups.includes(group.id) && styles.optionTextSelected,
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.optionButton,
                  selectedMuscleGroups.includes(group.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleMuscleGroup(group.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMuscleGroups.includes(group.id) && styles.optionTextSelected,
                  ]}
                >
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={isNextDisabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  imageContainer: {
    width: screenWidth,
    height: IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    marginTop: IMAGE_HEIGHT - 30,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 11,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 35,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginBottom: 16,
    paddingHorizontal: 42,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 42,
  },
  column: {
    flex: 1,
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
  },
  optionButtonSelected: {
    backgroundColor: colors.beige,
  },
  optionText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.darkBrown,
  },
});

