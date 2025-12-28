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

type RegisterGetFasterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGetFaster'
>;

interface RegisterGetFasterScreenProps {
  navigation: RegisterGetFasterScreenNavigationProp;
}

type FasterGoalType = 'sprint' | 'long-distance' | 'both';

const FASTER_OPTIONS = [
  { id: 'sprint' as FasterGoalType, label: 'I want to sprint faster' },
  { id: 'long-distance' as FasterGoalType, label: 'I want my long-distance pace to be faster' },
  { id: 'both' as FasterGoalType, label: 'Both' },
];

export const RegisterGetFasterScreen: React.FC<RegisterGetFasterScreenProps> = ({
  navigation,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<FasterGoalType | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterGetFasterScreen - Next pressed with goal:', selectedGoal);
    navigation.navigate('RegisterGetFasterDetails', { goalType: selectedGoal! });
  };

  const handleSelectGoal = (goalId: FasterGoalType) => {
    setSelectedGoal(goalId);
  };

  const isNextDisabled = selectedGoal === null;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-get-faster.png')}
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
        <Text style={styles.title}>GET FASTER</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          How do you want to get faster?
        </Text>

        <View style={styles.optionsContainer}>
          {FASTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedGoal === option.id && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelectGoal(option.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedGoal === option.id && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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
    gap: 16,
    paddingHorizontal: 42,
    width: '100%',
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
    width: 318,
    alignSelf: 'center',
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

