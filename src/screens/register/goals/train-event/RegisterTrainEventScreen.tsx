import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { NavigationArrows } from '../../../../components/NavigationArrows';
import { colors } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type RegisterTrainEventScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterTrainEvent'
>;

interface RegisterTrainEventScreenProps {
  navigation: RegisterTrainEventScreenNavigationProp;
}

const EVENT_OPTIONS = [
  { id: '5k', label: '5K' },
  { id: '10k', label: '10K' },
  { id: 'half-marathon', label: 'Half marathon' },
  { id: 'full-marathon', label: 'Full marathon' },
  { id: 'triathlon', label: 'Triathlon' },
  { id: 'iron-man', label: 'Iron man' },
  { id: 'other', label: 'Other' },
];

export const RegisterTrainEventScreen: React.FC<RegisterTrainEventScreenProps> = ({
  navigation,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (selectedEvent) {
      console.log('RegisterTrainEventScreen - Selected event:', selectedEvent);
      navigation.navigate('RegisterTrainEventDetails', { eventType: selectedEvent });
    }
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const isNextDisabled = !selectedEvent;

  const leftColumn = EVENT_OPTIONS.slice(0, 3);
  const rightColumn = EVENT_OPTIONS.slice(3, 6);
  const bottomOption = EVENT_OPTIONS[6];

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
          What event are you training for?
        </Text>

        <View style={styles.optionsContainer}>
          <View style={styles.column}>
            {leftColumn.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.optionButton,
                  selectedEvent === event.id && styles.optionButtonSelected,
                ]}
                onPress={() => handleEventSelect(event.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>
                  {event.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.optionButton,
                  selectedEvent === event.id && styles.optionButtonSelected,
                ]}
                onPress={() => handleEventSelect(event.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>
                  {event.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.fullWidthButton,
            selectedEvent === bottomOption.id && styles.optionButtonSelected,
          ]}
          onPress={() => handleEventSelect(bottomOption.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.optionText}>
            {bottomOption.label}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  column: {
    flex: 1,
    gap: 16,
  },
  optionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
  },
  optionButtonSelected: {
    backgroundColor: colors.beige,
  },
  optionText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  fullWidthButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 11,
    width: '100%',
  },
});

