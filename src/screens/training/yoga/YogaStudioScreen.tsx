import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NavigationArrows } from '../../../components/NavigationArrows';
import { colors } from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/profileService';
import { activityNavigationService } from '../../../services/activityNavigationService';
import { studioService } from '../../../services/studioService';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_HEIGHT = 348;

type YogaStudioScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'YogaStudio'
>;

interface YogaStudioScreenProps {
  navigation: YogaStudioScreenNavigationProp;
}

export const YogaStudioScreen: React.FC<YogaStudioScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customStudioName, setCustomStudioName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [studios, setStudios] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('YogaStudioScreen - Loading studios and saved data for user:', user.id);
      
      const studiosResult = await studioService.getStudiosByActivity('yoga');
      
      if (studiosResult.success && studiosResult.studios) {
        const studioNames = studiosResult.studios.map(studio => studio.name);
        studioNames.push('Other');
        setStudios(studioNames);
        console.log('YogaStudioScreen - Loaded studios:', studioNames);
      } else {
        console.log('YogaStudioScreen - Failed to load studios, using fallback');
        setStudios(['Yoga', 'Yoga Flow', 'Yoga SF', 'Funky Door Yoga', 'MNTSTUDIO', 'Other']);
      }

      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile?.onboarding_data?.yoga?.studio) {
        console.log('YogaStudioScreen - Pre-filling with saved studio');
        const savedStudio = result.profile.onboarding_data.yoga.studio;
        
        const allStudios = studiosResult.success && studiosResult.studios 
          ? [...studiosResult.studios.map(s => s.name), 'Other']
          : ['Yoga', 'Yoga Flow', 'Yoga SF', 'Funky Door Yoga', 'MNTSTUDIO', 'Other'];
        
        if (allStudios.includes(savedStudio)) {
          setSelectedStudio(savedStudio);
          setSearchText(savedStudio);
        } else {
          setSelectedStudio('Other');
          setSearchText('Other');
          setCustomStudioName(savedStudio);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const filteredStudios = studios.filter((studio) =>
    studio.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    const finalStudioName = selectedStudio === 'Other' ? customStudioName : (selectedStudio || searchText);
    
    setIsSaving(true);
    console.log('YogaStudioScreen - Saving progress with studio:', finalStudioName);

    const result = await profileService.getOnboardingStatus(user.id);
    const existingData = result.profile?.onboarding_data || {};

    const updatedData = {
      ...existingData,
      yoga: {
        ...existingData.yoga,
        studio: finalStudioName,
      },
    };

    const saveResult = await profileService.updateOnboardingProgress(
      user.id,
      'yoga_studio',
      { onboarding_data: updatedData }
    );

    if (!saveResult.success) {
      setIsSaving(false);
      console.log('YogaStudioScreen - Error saving progress:', saveResult.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('YogaStudioScreen - Progress saved, marking activity as completed');

    const marked = await activityNavigationService.markActivityCompleted(user.id, 'Yoga');

    if (!marked) {
      setIsSaving(false);
      Alert.alert('Error', 'Could not complete activity. Please try again.', [{ text: 'OK' }]);
      return;
    }

    const { screen } = await activityNavigationService.getNextActivityScreen(user.id, 'Yoga');

    setIsSaving(false);

    if (screen) {
      console.log('YogaStudioScreen - Navigating to next activity:', screen);
      navigation.navigate(screen as any);
    } else {
      console.log('YogaStudioScreen - All activities complete, navigating to AnythingElse');
      navigation.navigate('AnythingElse');
    }
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

  const isNextDisabled = selectedStudio === 'Other' ? !customStudioName.trim() : !searchText.trim() || isSaving;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

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
        <Text style={styles.title}>YOGA</Text>
        <Text style={styles.subtitle}>Let's break this down a bit more.</Text>

        <Text style={styles.question}>
          Where is your yoga membership?
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
              Enter your yoga studio:
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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

