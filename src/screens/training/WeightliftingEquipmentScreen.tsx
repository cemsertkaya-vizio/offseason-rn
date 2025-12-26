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
import { RootStackParamList } from '../../types/navigation';
import { NavigationArrows } from '../../components/NavigationArrows';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type WeightliftingEquipmentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WeightliftingEquipment'
>;

interface WeightliftingEquipmentScreenProps {
  navigation: WeightliftingEquipmentScreenNavigationProp;
}

const EQUIPMENT_OPTIONS = [
  { id: 'barbells', label: 'Barbells & plates' },
  { id: 'dumbells', label: 'Dumbells' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'liftingMachines', label: 'Lifting machines' },
  { id: 'cableMachines', label: 'Cable machines' },
  { id: 'none', label: 'None' },
];

export const WeightliftingEquipmentScreen: React.FC<WeightliftingEquipmentScreenProps> = ({
  navigation,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    console.log('WeightliftingEquipmentScreen - Next pressed with equipment:', selectedEquipment);
  };

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipment((prev) => {
      if (equipmentId === 'none') {
        return prev.includes('none') ? [] : ['none'];
      }
      const withoutNone = prev.filter((id) => id !== 'none');
      if (withoutNone.includes(equipmentId)) {
        return withoutNone.filter((id) => id !== equipmentId);
      }
      return [...withoutNone, equipmentId];
    });
  };

  const isNextDisabled = selectedEquipment.length === 0;

  const leftColumn = EQUIPMENT_OPTIONS.filter((_, index) => index % 2 === 0);
  const rightColumn = EQUIPMENT_OPTIONS.filter((_, index) => index % 2 === 1);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/coach-weightlifting.png')}
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
        <Text style={styles.title}>WEIGHTLIFTING</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.question}>
          What equipment do you have access to?
        </Text>

        <View style={styles.optionsContainer}>
          <View style={styles.column}>
            {leftColumn.map((equipment) => (
              <TouchableOpacity
                key={equipment.id}
                style={[
                  styles.optionButton,
                  selectedEquipment.includes(equipment.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleEquipment(equipment.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedEquipment.includes(equipment.id) && styles.optionTextSelected,
                  ]}
                >
                  {equipment.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((equipment) => (
              <TouchableOpacity
                key={equipment.id}
                style={[
                  styles.optionButton,
                  selectedEquipment.includes(equipment.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleEquipment(equipment.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedEquipment.includes(equipment.id) && styles.optionTextSelected,
                  ]}
                >
                  {equipment.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    paddingBottom: 20,
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
    marginBottom: 28,
  },
  question: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 42,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 42,
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
    paddingHorizontal: 12,
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
  optionTextSelected: {
    color: colors.darkBrown,
  },
});

