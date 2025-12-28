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
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { NavigationArrows } from '../../components/NavigationArrows';
import { ScrollPicker } from '../../components/ScrollPicker';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGetFasterDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGetFasterDetails'
>;

type RegisterGetFasterDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterGetFasterDetails'
>;

interface RegisterGetFasterDetailsScreenProps {
  navigation: RegisterGetFasterDetailsScreenNavigationProp;
  route: RegisterGetFasterDetailsScreenRouteProp;
}

type DistanceUnit = 'mile' | 'km' | 'meter';

const MINUTES_OPTIONS = Array.from({ length: 20 }, (_, i) => i);
const SECONDS_OPTIONS = Array.from({ length: 60 }, (_, i) => i);
const DISTANCE_UNITS: DistanceUnit[] = ['km', 'mile', 'meter'];

export const RegisterGetFasterDetailsScreen: React.FC<RegisterGetFasterDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { goalType } = route.params;
  const [minutes, setMinutes] = useState(7);
  const [seconds, setSeconds] = useState(30);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mile');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterGetFasterDetailsScreen - Goal type:', goalType);
    console.log('RegisterGetFasterDetailsScreen - Target pace:', {
      minutes,
      seconds,
      unit: distanceUnit,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/coach-get-faster.png')}
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
          What's your target pace?
        </Text>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <ScrollPicker
              value={minutes}
              onChange={setMinutes}
              options={MINUTES_OPTIONS}
              unit="min"
              width={50}
            />
            <Text style={styles.separator}>/</Text>
            <ScrollPicker
              value={seconds}
              onChange={setSeconds}
              options={SECONDS_OPTIONS}
              unit="sec"
              width={50}
            />
            <Text style={styles.separator}>/</Text>
            <ScrollPicker
              value={distanceUnit}
              onChange={setDistanceUnit}
              options={DISTANCE_UNITS}
              width={74}
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
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  separator: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '400',
    color: colors.white,
    marginHorizontal: 4,
  },
});

