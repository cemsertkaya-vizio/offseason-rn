import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components';
import { BackgroundImageSection } from '../components/BackgroundImageSection';
import { colors } from '../constants/colors';

type CoreProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CoreProfile'
>;

interface CoreProfileScreenProps {
  navigation: CoreProfileScreenNavigationProp;
}

export const CoreProfileScreen: React.FC<CoreProfileScreenProps> = ({ navigation }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleLetsGo = () => {
    console.log('CoreProfileScreen - Let\'s Go pressed');
    navigation.navigate('RegisterCoreProfile');
  };

  const handleTermsPress = () => {
    console.log('CoreProfileScreen - Terms & Conditions pressed');
  };

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../assets/coach-background.png')}
      />

      <View style={styles.content}>
        <View style={styles.chatContainer}>
          <ImageBackground
            source={require('../assets/bubble.png')}
            style={styles.chatBubble}
            resizeMode="contain"
          />
        </View>

        <View style={styles.coachSection}>
          <Image
            source={require('../assets/coach-onboarding-circle.png')}
            style={styles.coachCircle}
            resizeMode="contain"
          />
          <View style={styles.coachTextContainer}>
            <Text style={styles.coachTitle}>Coach</Text>
            <Text style={styles.coachSubtitle}>
              Your personalized coach at Offseason
            </Text>
          </View>
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            By signing up, you are agreeing to our{' '}
            <Text style={styles.termsLink} onPress={handleTermsPress}>
              Terms & Conditions
            </Text>
            .
          </Text>
        </View>

        <Button
          title="Let's Go"
          onPress={handleLetsGo}
          variant="secondary"
          style={styles.button}
          textStyle={styles.buttonText}
          disabled={!agreedToTerms}
        />
      </View>
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
    paddingTop: 17,
    alignItems: 'center',
  },
  chatContainer: {
    marginBottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  chatBubble: {
    width: 217,
    height: 146,
    marginBottom: 12,
  },
  chatText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkBrown,
    lineHeight: 20,
  },
  coachSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginLeft: -43,
  },
  coachCircle: {
    width:50,
    height: 50,
    marginRight: 0,
  },
  coachTextContainer: {
    flexDirection: 'column',
  },
  coachTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: '#F8F9FA',
    lineHeight: 19.4,
    marginBottom: 2,
  },
  coachSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8A89',
    lineHeight: 14.5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 0,
    alignSelf: 'center',
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderColor: colors.text.muted,
    borderRadius: 1,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.text.muted,
  },
  checkmark: {
    color: colors.darkBrown,
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  termsText: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: '400',
    color: colors.text.muted,
    lineHeight: 12.12,
    letterSpacing: 0,
    flexShrink: 0,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  button: {
    width: 304,
    height: 50,
    backgroundColor: colors.offWhite,
    borderRadius: 27.5,
    alignSelf: 'center',
    borderWidth: 0,
  },
  buttonText: {
    color: colors.darkBrown,
    fontWeight: '500',
    fontSize: 16,
  },
});

