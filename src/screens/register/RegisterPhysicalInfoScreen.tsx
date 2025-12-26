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
import { UnderlineTextField } from '../../components/UnderlineTextField';
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
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterPhysicalInfoScreen - Next pressed');
    navigation.navigate('RegisterLocation');
  };

  const isNextDisabled = !height.trim() || !weight.trim() || !age.trim() || !gender.trim();

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach-background.png')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Let's get you in the game.</Text>

        <View style={styles.inputsWrapper}>
          <UnderlineTextField
            placeholder="Height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            style={styles.textField}
          />

          <UnderlineTextField
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={styles.textField}
          />

          <UnderlineTextField
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.textField}
          />

          <UnderlineTextField
            placeholder="Gender"
            value={gender}
            onChangeText={setGender}
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
    marginBottom: 40,
  },
});

