import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { colors } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterGetStrongerDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGetStrongerDetails'
>;

interface RegisterGetStrongerDetailsScreenProps {
  navigation: RegisterGetStrongerDetailsScreenNavigationProp;
}

export const RegisterGetStrongerDetailsScreen: React.FC<RegisterGetStrongerDetailsScreenProps> = ({
  navigation,
}) => {
  const [specificGoal, setSpecificGoal] = useState('');
  const [skipGoal, setSkipGoal] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (skipGoal) {
      console.log('RegisterGetStrongerDetailsScreen - User chose to skip specific goal');
    } else {
      console.log('RegisterGetStrongerDetailsScreen - Specific goal:', specificGoal);
    }
    navigation.navigate('RegisterSummaryReview');
  };

  const handleSkipGoal = () => {
    setSkipGoal(true);
    setSpecificGoal('');
  };

  const handleTextInputFocus = () => {
    if (skipGoal) {
      setSkipGoal(false);
    }
  };

  const isNextDisabled = !skipGoal && specificGoal.trim().length === 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../../assets/coach-get-stronger.png')}
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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>GET STRONGER</Text>
        <Text style={styles.subtitle}>
          Let's break this down a bit more.
        </Text>

        <Text style={styles.question}>
          Do you have any specific strength goals you are targeting (e.g. bench 225 lbs)?
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              skipGoal && styles.textInputDisabled,
            ]}
            placeholder="Tell us more..."
            placeholderTextColor={colors.gray.muted}
            value={specificGoal}
            onChangeText={setSpecificGoal}
            onFocus={handleTextInputFocus}
            multiline
            editable={!skipGoal}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.skipButton,
            skipGoal && styles.skipButtonActive,
          ]}
          onPress={handleSkipGoal}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>
            No, I just want to feel stronger
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <NavigationArrows
        onBackPress={handleBack}
        onNextPress={handleNext}
        nextDisabled={isNextDisabled}
      />
    </KeyboardAvoidingView>
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
    marginBottom: 20,
    width: '100%',
    maxWidth: 312,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 332,
    marginBottom: 102,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  textInputDisabled: {
    opacity: 0.5,
  },
  skipButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
    width: '100%',
    maxWidth: 318,
  },
  skipButtonActive: {
    backgroundColor: colors.beige,
  },
  skipButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
});

