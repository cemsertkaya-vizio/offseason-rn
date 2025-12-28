import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { colors } from '../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type PilatesStudioScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PilatesStudio'
>;

interface PilatesStudioScreenProps {
  navigation: PilatesStudioScreenNavigationProp;
}

const STUDIOS = [
  'Sage',
  'Sage Pilates',
  'Core40',
  'Mighty Pilates',
  'MNTSTUDIO',
  'Other',
];

export const PilatesStudioScreen: React.FC<PilatesStudioScreenProps> = ({
  navigation,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customStudioName, setCustomStudioName] = useState('');

  const filteredStudios = STUDIOS.filter((studio) =>
    studio.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    const finalStudioName = selectedStudio === 'Other' ? customStudioName : (selectedStudio || searchText);
    console.log('PilatesStudioScreen - Next pressed with studio:', finalStudioName);
    // navigation.navigate('NextScreen');
  };

  const handleStudioSelect = (studio: string) => {
    setSelectedStudio(studio);
    setSearchText(studio);
    setShowDropdown(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setShowDropdown(text.length > 0);
    if (text.length === 0) {
      setSelectedStudio(null);
    }
  };

  const isNextDisabled = selectedStudio === 'Other' ? !customStudioName.trim() : !searchText.trim();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/coach-yoga.png')}
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
        <Text style={styles.title}>PILATES</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.question}>
          Where is your pilates membership?
        </Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search studios"
              placeholderTextColor={colors.gray.muted}
              value={searchText}
              onChangeText={handleSearchChange}
              onFocus={() => searchText.length > 0 && setShowDropdown(true)}
            />
            <View style={styles.searchIcon}>
              <View style={styles.searchIconCircle} />
              <View style={styles.searchIconHandle} />
            </View>
          </View>

          {showDropdown && filteredStudios.length > 0 && (
            <View style={styles.dropdown}>
              {filteredStudios.map((studio, index) => (
                <TouchableOpacity
                  key={studio}
                  style={[
                    styles.dropdownItem,
                    selectedStudio === studio && styles.dropdownItemSelected,
                    index !== filteredStudios.length - 1 && styles.dropdownItemBorder,
                  ]}
                  onPress={() => handleStudioSelect(studio)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedStudio === studio && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {studio}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedStudio === 'Other' && (
          <View style={styles.customStudioContainer}>
            <Text style={styles.customStudioLabel}>
              Enter your pilates studio:
            </Text>
            <View style={styles.customStudioInputWrapper}>
              <TextInput
                style={styles.customStudioInput}
                placeholder="Type here..."
                placeholderTextColor={colors.gray.muted}
                value={customStudioName}
                onChangeText={setCustomStudioName}
              />
            </View>
          </View>
        )}
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
    textAlign: 'left',
    marginBottom: 20,
    paddingHorizontal: 42,
    alignSelf: 'flex-start',
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 37,
    position: 'relative',
  },
  searchInputWrapper: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: 'transparent',
    borderWidth: 0.75,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 21,
    paddingRight: 50,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  searchIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 16,
    height: 16,
  },
  searchIconCircle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1.5,
    borderColor: colors.offWhite,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchIconHandle: {
    width: 5,
    height: 1.5,
    backgroundColor: colors.offWhite,
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: 51,
    left: 37,
    right: 37,
    backgroundColor: 'transparent',
    borderWidth: 0.75,
    borderColor: colors.offWhite,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 21,
    paddingVertical: 12,
    minHeight: 42,
    justifyContent: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: colors.beige,
  },
  dropdownItemBorder: {
    borderBottomWidth: 0.75,
    borderBottomColor: colors.offWhite,
  },
  dropdownItemText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
  dropdownItemTextSelected: {
    color: colors.darkBrown,
  },
  customStudioContainer: {
    width: '100%',
    paddingHorizontal: 42,
    marginTop: 45,
  },
  customStudioLabel: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginBottom: 15,
  },
  customStudioInputWrapper: {
    position: 'relative',
  },
  customStudioInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderRadius: 10,
    height: 51,
    paddingHorizontal: 21,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
  },
});

