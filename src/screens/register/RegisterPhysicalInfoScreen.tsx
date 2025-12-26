import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { NavigationArrows } from '../../components/NavigationArrows';
import { HeightPicker } from '../../components/HeightPicker';
import { WeightInput } from '../../components/WeightInput';
import { AgeInput } from '../../components/AgeInput';
import { GenderPicker } from '../../components/GenderPicker';
import { colors } from '../../constants/colors';

type RegisterPhysicalInfoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterPhysicalInfo'
>;

interface RegisterPhysicalInfoScreenProps {
  navigation: RegisterPhysicalInfoScreenNavigationProp;
}

export const RegisterPhysicalInfoScreen: React.FC<RegisterPhysicalInfoScreenProps> = ({
  navigation,
}) => {
  const [height, setHeight] = useState<{ feet: number; inches: number } | null>(null);
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [ageIsValid, setAgeIsValid] = useState(false);
  const [gender, setGender] = useState<string | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterPhysicalInfoScreen - Next pressed');
    navigation.navigate('RegisterLocation');
  };

  const isHeightValid = height !== null;
  const isWeightValid = weight.trim() !== '' && parseInt(weight, 10) > 0;
  const isAgeValid = age.trim() !== '' && ageIsValid;
  const isGenderValid = gender !== null && gender !== '';

  const isNextDisabled = !isHeightValid || !isWeightValid || !isAgeValid || !isGenderValid;

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach-background.png')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Let's get you in the game.</Text>

        <View style={styles.inputsWrapper}>
          <HeightPicker
            value={height}
            onChange={setHeight}
            style={styles.textField}
          />

          <WeightInput
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            style={styles.textField}
          />

          <AgeInput
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            onValidationChange={setAgeIsValid}
            style={styles.textField}
          />

          <GenderPicker
            value={gender}
            onChange={setGender}
            style={styles.textField}
          />
        </View>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 49,
    paddingTop: 19,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 40,
  },
  inputsWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  textField: {
    marginBottom: 0,
  },
});

