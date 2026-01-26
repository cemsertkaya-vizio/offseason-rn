import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { UnderlineTextField } from '../../components/UnderlineTextField';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { profileService } from '../../services/profileService';

const SF_NEIGHBORHOODS = [
  'Alamo Square',
  'Bayview',
  'Bernal Heights',
  'Castro',
  'Chinatown',
  'Civic Center',
  'Cole Valley',
  'Cow Hollow',
  'Dogpatch',
  'Excelsior',
  'Financial District',
  "Fisherman's Wharf",
  'Glen Park',
  'Haight-Ashbury',
  'Hayes Valley',
  'Inner Richmond',
  'Inner Sunset',
  'Jackson Square',
  'Japantown',
  'Laurel Heights',
  'Lower Haight',
  'Lower Pacific Heights',
  'Marina',
  'Mission',
  'Mission Bay',
  'Nob Hill',
  'Noe Valley',
  'North Beach',
  'Outer Richmond',
  'Outer Sunset',
  'Pacific Heights',
  'Parkside',
  'Portola',
  'Potrero Hill',
  'Presidio',
  'Presidio Heights',
  'Russian Hill',
  'Sea Cliff',
  'SoMa',
  'South Beach',
  'Sunset',
  'Telegraph Hill',
  'Tenderloin',
  'Twin Peaks',
  'Union Square',
  'Visitacion Valley',
  'West Portal',
  'Western Addition',
];

type EditLocationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditLocation'
>;

interface EditLocationScreenProps {
  navigation: EditLocationScreenNavigationProp;
}

export const EditLocationScreen: React.FC<EditLocationScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [location, setLocation] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredNeighborhoods = useMemo(() => {
    if (!searchText.trim()) {
      return SF_NEIGHBORHOODS;
    }
    const query = searchText.toLowerCase();
    return SF_NEIGHBORHOODS.filter((neighborhood) =>
      neighborhood.toLowerCase().includes(query)
    );
  }, [searchText]);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
    setLocation(text);
    setShowSuggestions(true);
  }, []);

  useEffect(() => {
    const loadSavedData = async () => {
      if (profile?.location) {
        console.log(
          'EditLocationScreen - Pre-filling with saved location:',
          profile.location
        );
        setLocation(profile.location);
        setSearchText(profile.location);
      }
      setIsLoading(false);
    };

    loadSavedData();
  }, [profile]);

  const handleNeighborhoodSelect = useCallback((neighborhood: string) => {
    setLocation(neighborhood);
    setSearchText(neighborhood);
    setShowSuggestions(false);
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setIsSaving(true);
    console.log('EditLocationScreen - Saving location:', location);

    const result = await profileService.updateProfile(user.id, { location });

    setIsSaving(false);

    if (result.success) {
      console.log('EditLocationScreen - Location saved successfully');
      await refreshProfile();
      navigation.goBack();
    } else {
      console.log('EditLocationScreen - Error saving location:', result.error);
      Alert.alert('Error', 'Could not save your location. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const isSaveDisabled = !location.trim() || isSaving;

  const renderNeighborhoodItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleNeighborhoodSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionTitle}>{item}</Text>
      <Text style={styles.suggestionSubtitle}>San Francisco, CA</Text>
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
        <Text style={styles.title}>edit your location</Text>
        <Text style={styles.subtitle}>
          Update your city to stay connected with local events.
        </Text>

        <View style={styles.inputsWrapper}>
          <UnderlineTextField
            placeholder="Neighborhood, City, State"
            value={searchText}
            onChangeText={handleTextChange}
            style={styles.textField}
          />

          {showSuggestions && filteredNeighborhoods.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredNeighborhoods}
                renderItem={renderNeighborhoodItem}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                nestedScrollEnabled={true}
                style={styles.suggestionsList}
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={colors.offWhite} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaveDisabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.darkBrown} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
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
    lineHeight: 39,
    marginBottom: 12,
    textTransform: 'uppercase',
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
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray.muted,
  },
  saveButtonText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.darkBrown,
    textTransform: 'uppercase',
  },
});
