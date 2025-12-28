import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { colors } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterTrainEventCurrentStatusScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterTrainEventCurrentStatus'
>;

type RegisterTrainEventCurrentStatusScreenRouteProp = RouteProp<
  RootStackParamList,
  'RegisterTrainEventCurrentStatus'
>;

interface RegisterTrainEventCurrentStatusScreenProps {
  navigation: RegisterTrainEventCurrentStatusScreenNavigationProp;
  route: RegisterTrainEventCurrentStatusScreenRouteProp;
}

export const RegisterTrainEventCurrentStatusScreen: React.FC<RegisterTrainEventCurrentStatusScreenProps> = ({
  navigation,
  route,
}) => {
  const { eventType, eventMonth, eventYear } = route.params;
  const [trainingDescription, setTrainingDescription] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('RegisterTrainEventCurrentStatusScreen - Event type:', eventType);
    console.log('RegisterTrainEventCurrentStatusScreen - Event date:', eventMonth, eventYear);
    console.log('RegisterTrainEventCurrentStatusScreen - Training description:', trainingDescription);
    navigation.navigate('RegisterSummaryReview');
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
          Describe where you're at in your training.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={trainingDescription}
            onChangeText={setTrainingDescription}
            placeholder="Tell us more..."
            placeholderTextColor="#8e8a89"
            multiline
            textAlignVertical="top"
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
    marginBottom: 35,
    width: '100%',
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    width: '100%',
  },
});

