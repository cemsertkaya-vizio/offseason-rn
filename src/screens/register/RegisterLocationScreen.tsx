import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { NavigationArrows } from '../../components/NavigationArrows';
import { UnderlineTextField } from '../../components/UnderlineTextField';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';

const { MapKitSearchCompleter } = NativeModules;

type RegisterLocationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterLocation'
>;

interface RegisterLocationScreenProps {
  navigation: RegisterLocationScreenNavigationProp;
}

interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullText: string;
}

export const RegisterLocationScreen: React.FC<RegisterLocationScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (Platform.OS !== 'ios') {
      console.log('RegisterLocationScreen - MapKit search only available on iOS');
      return;
    }

    try {
      const results = await MapKitSearchCompleter.search(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.log('RegisterLocationScreen - Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setLocation(text);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchLocation(text);
    }, 300);
  }, [searchLocation]);

  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('RegisterLocationScreen - Loading saved data for user:', user.id);
      const result = await profileService.getOnboardingStatus(user.id);

      if (result.success && result.profile && result.profile.location) {
        console.log('RegisterLocationScreen - Pre-filling with saved location');
        setLocation(result.profile.location);
      }

      setIsLoading(false);
    };

    loadSavedData();

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [user]);

  const handleSuggestionSelect = useCallback((suggestion: LocationSuggestion) => {
    setLocation(suggestion.fullText);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    setIsSaving(true);
    console.log('RegisterLocationScreen - Saving progress');

    const result = await profileService.updateOnboardingProgress(
      user.id,
      'location',
      { location }
    );

    setIsSaving(false);

    if (result.success) {
      console.log('RegisterLocationScreen - Progress saved, navigating to preferences');
      navigation.navigate('RegisterPreferences');
    } else {
      console.log('RegisterLocationScreen - Error saving progress:', result.error);
      Alert.alert(
        'Error',
        'Could not save your information. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const isNextDisabled = !location.trim() || isSaving;

  const renderSuggestionItem = ({ item }: { item: LocationSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionTitle}>{item.title}</Text>
      {item.subtitle ? (
        <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
      ) : null}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.offWhite} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundImageSection
        source={require('../../assets/coach2-background.png')}
      />

      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>what city are you in?</Text>
        <Text style={styles.subtitle}>We'll connect you with what's around.</Text>

        <View style={styles.inputsWrapper}>
          <UnderlineTextField
            placeholder="Neighborhood, City, State"
            value={location}
            onChangeText={handleTextChange}
            style={styles.textField}
          />

          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                style={styles.suggestionsList}
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

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
  content: {
    flex: 1,
  },
  scrollContent: {
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
    marginBottom: 8,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: colors.darkBrown,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionTitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500',
    color: colors.offWhite,
  },
  suggestionSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});
