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
import { RootStackParamList } from '../../types/navigation';
import { NavigationArrows } from '../../components/NavigationArrows';
import { ScrollPicker } from '../../components/ScrollPicker';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 270;

type SwimmingExampleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SwimmingExample'
>;

interface SwimmingExampleScreenProps {
  navigation: SwimmingExampleScreenNavigationProp;
}

const SETS_OPTIONS = [7, 8, 9];
const METERS_OPTIONS = [75, 100, 125];
const SECONDS_OPTIONS = [85, 90, 95];
const STROKE_OPTIONS = ['Butterfly', 'Freestyle', 'Backstroke'];

export const SwimmingExampleScreen: React.FC<SwimmingExampleScreenProps> = ({
  navigation,
}) => {
  const [sets, setSets] = useState(8);
  const [meters, setMeters] = useState(100);
  const [seconds, setSeconds] = useState(90);
  const [stroke, setStroke] = useState('Freestyle');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('SwimmingExampleScreen - Next pressed:', { sets, meters, seconds, stroke });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/coach-swimming.png')}
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
        <Text style={styles.title}>SWIMMING</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.description}>
          Give us an example of what a challenging but doable set looks like for you. For example, 8x100m freestyle; 90 seconds each.
        </Text>

        <View style={styles.pickersRow}>
          <ScrollPicker
            value={sets}
            onChange={setSets}
            options={SETS_OPTIONS}
            unit="sets"
            width={50}
          />
          
          <Text style={styles.multiplier}>x</Text>
          
          <ScrollPicker
            value={meters}
            onChange={setMeters}
            options={METERS_OPTIONS}
            unit="meters"
            width={50}
          />
        </View>

        <View style={styles.secondsPickerContainer}>
          <ScrollPicker
            value={seconds}
            onChange={setSeconds}
            options={SECONDS_OPTIONS}
            unit="seconds"
            width={50}
          />
        </View>

        <View style={styles.strokePickerContainer}>
          <ScrollPicker
            value={stroke}
            onChange={setStroke}
            options={STROKE_OPTIONS}
            width={112}
          />
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
    marginBottom: 22,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    marginBottom: 26,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  multiplier: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginHorizontal: 12,
    marginBottom: 32,
  },
  secondsPickerContainer: {
    marginBottom: 16,
  },
  strokePickerContainer: {
    marginBottom: 16,
  },
});


