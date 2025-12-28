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
import { ScrollPicker } from '../../../../components/ScrollPicker';
import { colors } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGainMuscleDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGainMuscleDetails'
>;

interface RegisterGainMuscleDetailsScreenProps {
  navigation: RegisterGainMuscleDetailsScreenNavigationProp;
}

const MUSCLE_MASS_GOAL_OPTIONS = Array.from({ length: 200 }, (_, i) => i + 1);

export const RegisterGainMuscleDetailsScreen: React.FC<RegisterGainMuscleDetailsScreenProps> = ({
  navigation,
}) => {
  const [muscleMassGoal, setMuscleMassGoal] = useState(65);
  const [dontKnow, setDontKnow] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (dontKnow) {
      console.log('RegisterGainMuscleDetailsScreen - User does not know muscle mass goal');
    } else {
      console.log('RegisterGainMuscleDetailsScreen - Muscle mass goal:', muscleMassGoal, 'lbs');
    }
  };

  const handleDontKnow = () => {
    setDontKnow(true);
  };

  const handlePickerChange = (value: number) => {
    setMuscleMassGoal(value);
    if (dontKnow) {
      setDontKnow(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-gain-muscle.png')}
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
        <Text style={styles.title}>GAIN MUSCLE MASS</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          How much muscle mass do you want to gain?
        </Text>

        <View style={styles.pickerContainer}>
          <ScrollPicker
            value={muscleMassGoal}
            onChange={handlePickerChange}
            options={MUSCLE_MASS_GOAL_OPTIONS}
            unit="lbs"
            width={63}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.dontKnowButton,
            dontKnow && styles.dontKnowButtonActive,
          ]}
          onPress={handleDontKnow}
          activeOpacity={0.7}
        >
          <Text style={styles.dontKnowButtonText}>
            I don't know
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
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
    paddingBottom: 130,
    paddingHorizontal: 42,
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
    marginBottom: 25,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginBottom: 29,
    width: '100%',
  },
  pickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 56,
  },
  dontKnowButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
    width: '100%',
    maxWidth: 318,
  },
  dontKnowButtonActive: {
    backgroundColor: colors.beige,
  },
  dontKnowButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
});

