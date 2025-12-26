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

type RegisterLocationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterLocation'
>;

interface RegisterLocationScreenProps {
  navigation: RegisterLocationScreenNavigationProp;
}

export const RegisterLocationScreen: React.FC<RegisterLocationScreenProps> = ({
  navigation,
}) => {
  const [location, setLocation] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterLocationScreen - Next pressed');
  };

  const isNextDisabled = !location.trim();

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach2-background.png')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>what city are you in?</Text>
        <Text style={styles.subtitle}>We'll connect you with what's around.</Text>

        <View style={styles.inputsWrapper}>
          <UnderlineTextField
            placeholder="Neighborhood, City, State"
            value={location}
            onChangeText={setLocation}
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
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputsWrapper: {
    width: '100%',
    alignItems: 'flex-start',
  },
  textField: {
    marginBottom: 40,
  },
});

