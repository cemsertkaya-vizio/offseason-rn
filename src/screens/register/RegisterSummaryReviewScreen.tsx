import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useRegistration } from '../../contexts/RegistrationContext';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

type RegisterSummaryReviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterSummaryReview'
>;

interface RegisterSummaryReviewScreenProps {
  navigation: RegisterSummaryReviewScreenNavigationProp;
}

export const RegisterSummaryReviewScreen: React.FC<RegisterSummaryReviewScreenProps> = ({
  navigation,
}) => {
  const { registrationData, updateRegistrationData, clearRegistrationData } = useRegistration();
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [selectedButton, setSelectedButton] = useState<'approve' | 'edit' | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const handleApprove = () => {
    setSelectedButton('approve');
    setIsApproved(true);
    updateRegistrationData({ profileSummary: summaryText });
  };

  const handleEdit = () => {
    setSelectedButton('edit');
  };

  const handleGetStarted = async () => {
    console.log('RegisterSummaryReviewScreen - Get Started pressed');
    
    if (!user) {
      Alert.alert('Error', 'You must be authenticated to complete registration. Please restart the registration process.');
      return;
    }

    if (!registrationData.firstName || !registrationData.phoneNumber) {
      Alert.alert('Error', 'Registration data incomplete. Please go back and complete all steps.');
      return;
    }

    setIsCreatingProfile(true);
    console.log('RegisterSummaryReviewScreen - Creating profile for user:', user.id);

    const profileResult = await profileService.createProfile(
      user.id,
      registrationData as any
    );

    setIsCreatingProfile(false);

    if (profileResult.success) {
      console.log('RegisterSummaryReviewScreen - Profile created successfully, registration complete');
      clearRegistrationData();
      navigation.replace('Home');
    } else {
      console.log('RegisterSummaryReviewScreen - Error creating profile:', profileResult.error);
      Alert.alert(
        'Error',
        profileResult.error || 'Failed to create profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSendMessage = () => {
    if (editMessage.trim()) {
      console.log('RegisterSummaryReviewScreen - Edit message sent:', editMessage);
      setEditMessage('');
    }
  };

  const summaryText = "Jodie Z is an ex-tennis player now training for a half-marathon in March. She loves running, hiking, yoga, and swimming.";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>SUMMARY REVIEW</Text>

        <View style={styles.messageContainer}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              We loved getting to know you better!
            </Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              Before we move forward, let's make sure we've got everything right.
            </Text>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              Here's what we have for your summary. You can always edit later.
            </Text>
          </View>

          <View style={styles.messageRow}>
            <View style={styles.shadow} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{summaryText}</Text>
              <View style={styles.glowOverlay} />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedButton === 'approve' && styles.actionButtonSelected,
              ]}
              onPress={handleApprove}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {isApproved && (
            <>
              <View style={styles.messageRow}>
                <View style={styles.shadow} />
                <View style={[styles.messageBubble, styles.messageBubbleInRow]}>
                  <Text style={styles.messageText}>
                    Thanks for confirming! We will now create your plan within the next 12 hours. Our Founder will reach out to you if we have any questions.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.7}
                disabled={isCreatingProfile}
              >
                {isCreatingProfile ? (
                  <ActivityIndicator size="small" color={colors.darkBrown} />
                ) : (
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {!isApproved && (
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={editMessage}
              onChangeText={setEditMessage}
              placeholder="Type here..."
              placeholderTextColor={colors.gray.muted}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              activeOpacity={0.7}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 95,
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'center',
    lineHeight: 38.78,
    marginBottom: 30,
  },
  messageContainer: {
    width: screenWidth,
    paddingHorizontal: 42,
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    width: '100%',
  },
  messageBubble: {
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 14,
    marginBottom: 14,
    maxWidth: screenWidth - 120,
    marginLeft: 36,
  },
  messageBubbleInRow: {
    marginBottom: 0,
    marginLeft: 0,
    flex: 1,
  },
  messageText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.darkBrown,
    lineHeight: 20,
  },
  summaryBox: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: colors.offWhite,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 14,
    maxWidth: screenWidth - 120,
    position: 'relative',
    flex: 1,
  },
  summaryText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '400',
    color: colors.offWhite,
    lineHeight: 20,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 0,
    shadowColor: colors.offWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 0,
  },
  shadow: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: colors.offWhite,
    shadowColor: colors.offWhite,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 10,
    marginRight: 7,
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    marginLeft: 36,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 8,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  actionButtonSelected: {
    backgroundColor: colors.beige,
  },
  actionButtonText: {
    fontFamily: 'Roboto',
    fontSize: 8,
    fontWeight: '500',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: colors.offWhite,
    borderRadius: 28,
    paddingHorizontal: 60,
    paddingVertical: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: 304,
  },
  getStartedButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkBrown,
    textAlign: 'center',
  },
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 37,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: colors.darkBrown,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    height: 45,
    paddingHorizontal: 18,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkBrown,
    paddingVertical: 0,
  },
  sendButton: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.darkBrown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: colors.offWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});

