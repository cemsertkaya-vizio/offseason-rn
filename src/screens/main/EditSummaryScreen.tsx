import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../types/navigation';
import { BackgroundImageSection } from '../../components/BackgroundImageSection';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { profileService } from '../../services/profileService';

type EditSummaryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditSummary'
>;

interface EditSummaryScreenProps {
  navigation: EditSummaryScreenNavigationProp;
}

export const EditSummaryScreen: React.FC<EditSummaryScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.profile_summary) {
      console.log('EditSummaryScreen - Pre-filling with saved summary');
      setSummary(profile.profile_summary);
    }
    setIsLoading(false);
  }, [profile]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    if (!summary.trim()) {
      Alert.alert('Error', 'Please enter a summary');
      return;
    }

    setIsSaving(true);
    console.log('EditSummaryScreen - Saving summary');

    const result = await profileService.updateProfile(user.id, {
      profile_summary: summary,
    });

    setIsSaving(false);

    if (result.success) {
      console.log('EditSummaryScreen - Summary saved successfully');
      await refreshProfile();
      navigation.goBack();
    } else {
      console.log('EditSummaryScreen - Error saving summary:', result.error);
      Alert.alert('Error', 'Could not save your summary. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const isSaveDisabled = !summary.trim() || isSaving;

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
        <View style={styles.contentInner}>
          <Text style={styles.title}>edit your summary</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself, your fitness background, and what you're
            training for.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={summary}
              onChangeText={setSummary}
              placeholder="e.g., Jodie Z is an ex-tennis player now training for a half marathon in August. She loves running, hiking, yoga, and swimming for fun."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.charCount}>{summary.length} / 300</Text>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color={colors.offWhite} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
            ]}
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
      </KeyboardAwareScrollView>
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
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  contentInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 19,
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
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    minHeight: 150,
  },
  textInput: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
    minHeight: 120,
  },
  charCount: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
    marginTop: 8,
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
