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

type RegisterCoreProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterCoreProfile'
>;

interface RegisterCoreProfileScreenProps {
  navigation: RegisterCoreProfileScreenNavigationProp;
}

export const RegisterCoreProfileScreen: React.FC<RegisterCoreProfileScreenProps> = ({
  navigation,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterCoreProfileScreen - Next pressed');
    navigation.navigate('RegisterPhysicalInfo');
  };

  const isNextDisabled = !firstName.trim() || !lastName.trim() || !phoneNumber.trim();

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach-background.png')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Let's get you in the game.</Text>

        <View style={styles.inputsWrapper}>
          <UnderlineTextField
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.textField}
          />

          <UnderlineTextField
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.textField}
          />

          <UnderlineTextField
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
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

