import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { WeightPicker } from '../../../components/WeightPicker';
import { colors } from '../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 233;

type WeightliftingMaxesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WeightliftingMaxes'
>;

interface WeightliftingMaxesScreenProps {
  navigation: WeightliftingMaxesScreenNavigationProp;
}

interface LiftMaxState {
  squat: number;
  bench: number;
  deadlift: number;
}

export const WeightliftingMaxesScreen: React.FC<WeightliftingMaxesScreenProps> = ({
  navigation,
}) => {
  const [maxes, setMaxes] = useState<LiftMaxState>({
    squat: 130,
    bench: 130,
    deadlift: 130,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('WeightliftingMaxesScreen - Next pressed with maxes:', maxes);
  };

  const updateMax = (lift: keyof LiftMaxState, value: number) => {
    setMaxes((prev) => ({
      ...prev,
      [lift]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/coach-weightlifting.png')}
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
        <Text style={styles.title}>WEIGHTLIFTING</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <View style={styles.liftsContainer}>
          <View style={styles.liftRow}>
            <Text style={styles.liftQuestion}>
              How heavy can you squat (one rep max)?
            </Text>
            <WeightPicker
              value={maxes.squat}
              onChange={(value) => updateMax('squat', value)}
              minValue={0}
              maxValue={500}
              step={5}
            />
          </View>

          <View style={styles.liftRow}>
            <Text style={styles.liftQuestion}>
              How heavy can you bench press?
            </Text>
            <WeightPicker
              value={maxes.bench}
              onChange={(value) => updateMax('bench', value)}
              minValue={0}
              maxValue={500}
              step={5}
            />
          </View>

          <View style={styles.liftRow}>
            <Text style={styles.liftQuestion}>
              How heavy can you deadlift?
            </Text>
            <WeightPicker
              value={maxes.deadlift}
              onChange={(value) => updateMax('deadlift', value)}
              minValue={0}
              maxValue={500}
              step={5}
            />
          </View>
        </View>
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
    marginTop: IMAGE_HEIGHT - 20,
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
    marginBottom: 28,
  },
  liftsContainer: {
    width: '100%',
    paddingHorizontal: 55,
    gap: 38,
  },
  liftRow: {
    alignItems: 'center',
  },
  liftQuestion: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
});
