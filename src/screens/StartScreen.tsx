import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Button } from '../components';

const { width, height } = Dimensions.get('window');

type StartScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Start'
>;

interface StartScreenProps {
  navigation: StartScreenNavigationProp;
}

export const StartScreen: React.FC<StartScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    console.log('StartScreen - Get Started pressed');
    navigation.navigate('CoreProfile');
  };

  const handleLogIn = () => {
    console.log('StartScreen - Log In pressed');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.overlay} />
        
        <View style={styles.content}>
          <View style={styles.bottomSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo-white.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                variant="secondary"
                style={styles.getStartedButton}
                textStyle={styles.getStartedButtonText}
              />

              <View style={styles.loginTextContainer}>
                <Text style={styles.loginText}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleLogIn}>
                  <Text style={[styles.loginText, styles.loginLink]}>
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },
  logoContainer: {
    width: 304,
    aspectRatio: 1,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    maxWidth: 304,
    backgroundColor: '#F8F9FA',
    borderWidth: 0,
    borderRadius: 27.5,
  },
  getStartedButtonText: {
    color: '#251B19',
    fontWeight: '500',
  },
  loginTextContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  loginLink: {
    color: '#ECD7C5',
    fontWeight: '500',
  },
});

