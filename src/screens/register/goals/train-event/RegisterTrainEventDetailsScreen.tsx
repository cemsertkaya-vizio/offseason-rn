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
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { ScrollPicker } from '../../../../components/ScrollPicker';
import { colors } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterTrainEventDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterTrainEventDetails'
>;

type RegisterTrainEventDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterTrainEventDetails'
>;

interface RegisterTrainEventDetailsScreenProps {
  navigation: RegisterTrainEventDetailsScreenNavigationProp;
  route: RegisterTrainEventDetailsScreenRouteProp;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

export const RegisterTrainEventDetailsScreen: React.FC<RegisterTrainEventDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventType } = route.params;
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterTrainEventDetailsScreen - Event type:', eventType);
    console.log('RegisterTrainEventDetailsScreen - Event date:', selectedMonth, selectedYear);
    navigation.navigate('RegisterTrainEventTrainingStatus', {
      eventType,
      eventMonth: selectedMonth,
      eventYear: selectedYear,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-athlete.png')}
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
        <Text style={styles.title}>TRAIN FOR AN EVENT</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          When is the event?
        </Text>

        <View style={styles.datePickerContainer}>
          <ScrollPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={MONTHS}
            width={127}
          />
          <View style={styles.pickerSpacing} />
          <ScrollPicker
            value={selectedYear}
            onChange={setSelectedYear}
            options={YEARS}
            width={63}
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
    marginBottom: 64,
    width: '100%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pickerSpacing: {
    width: 16,
  },
});

