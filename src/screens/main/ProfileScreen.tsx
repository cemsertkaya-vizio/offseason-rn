import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { colors } from '../../constants/colors';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { RootStackParamList } from '../../types/navigation';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface WearableDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'oura_ring';
  isConnected: boolean;
}

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();

  const [showPhotoActionSheet, setShowPhotoActionSheet] = useState(false);
  const [showWearableSheet, setShowWearableSheet] = useState(false);
  const [isEditingWearable, setIsEditingWearable] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('ProfileScreen - Screen focused, refreshing profile');
      refreshProfile();
    }, [refreshProfile])
  );

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : 'User';

  const shortName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name?.charAt(0) || ''}`
    : 'User';

  const profileSummary = profile?.profile_summary || '';
  const location = profile?.location || 'Not set';
  const profileImageUrl = profile?.profile_image_url;

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const result = await authService.signOut();
          if (result.success) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Start' }],
            });
          }
        },
      },
    ]);
  };

  const handleEditPhoto = () => {
    setShowPhotoActionSheet(true);
  };

  const uploadImage = async (imageUri: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsUploadingImage(true);
    console.log('ProfileScreen - Uploading image...');

    const uploadResult = await storageService.uploadProfileImage(user.id, imageUri);

    if (!uploadResult.success || !uploadResult.url) {
      setIsUploadingImage(false);
      Alert.alert('Error', uploadResult.error || 'Failed to upload image');
      return;
    }

    const updateResult = await profileService.updateProfileImage(user.id, uploadResult.url);

    setIsUploadingImage(false);

    if (updateResult.success) {
      console.log('ProfileScreen - Profile image updated successfully');
      refreshProfile();
    } else {
      Alert.alert('Error', updateResult.error || 'Failed to update profile');
    }
  };

  const handlePhotoOption = (option: 'library' | 'camera' | 'remove') => {
    setShowPhotoActionSheet(false);
    console.log('ProfileScreen - Photo option selected:', option);

    // Delay picker launch to allow modal to close first
    // This prevents conflicts on iOS when presenting the picker while modal animates
    setTimeout(async () => {
      if (option === 'library') {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1024,
          maxHeight: 1024,
        });

        if (result.errorCode) {
          console.log('ProfileScreen - Image picker error:', result.errorCode, result.errorMessage);
          return;
        }

        if (result.assets && result.assets[0]?.uri) {
          await uploadImage(result.assets[0].uri);
        }
      } else if (option === 'camera') {
        const result = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1024,
          maxHeight: 1024,
        });

        if (result.errorCode) {
          console.log('ProfileScreen - Camera error:', result.errorCode, result.errorMessage);
          return;
        }

        if (result.assets && result.assets[0]?.uri) {
          await uploadImage(result.assets[0].uri);
        }
      } else if (option === 'remove') {
        await handleRemoveImage();
      }
    }, 400);
  };

  const handleRemoveImage = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsUploadingImage(true);

    const deleteResult = await storageService.deleteProfileImage(user.id);
    if (!deleteResult.success) {
      setIsUploadingImage(false);
      Alert.alert('Error', deleteResult.error || 'Failed to delete image');
      return;
    }

    const updateResult = await profileService.removeProfileImage(user.id);
    setIsUploadingImage(false);

    if (updateResult.success) {
      console.log('ProfileScreen - Profile image removed successfully');
      refreshProfile();
    } else {
      Alert.alert('Error', updateResult.error || 'Failed to update profile');
    }
  };


  const handleReferFriends = () => {
    console.log('ProfileScreen - Navigating to ReferFriends');
    navigation.navigate('ReferFriends');
  };

  const handleEditSummary = () => {
    console.log('ProfileScreen - Navigate to edit summary');
    navigation.navigate('EditSummary');
  };

  const handleEditLocation = () => {
    console.log('ProfileScreen - Navigate to edit location');
    navigation.navigate('EditLocation');
  };

  const handleEditWearable = () => {
    Alert.alert(
      'Coming Soon',
      'Wearable integration is currently under development. Stay tuned!',
      [{ text: 'OK' }]
    );
  };

  const handleConnectNewDevice = () => {
    Alert.alert(
      'Coming Soon',
      'Wearable integration is currently under development. Stay tuned!',
      [{ text: 'OK' }]
    );
  };

  const handleConnectDevice = async (deviceType: 'apple_watch' | 'oura_ring') => {
    setIsConnecting(true);
    console.log('ProfileScreen - Connecting device:', deviceType);

    // Simulate connection process
    setTimeout(() => {
      const newDevice: WearableDevice = {
        id: `${deviceType}-${Date.now()}`,
        name:
          deviceType === 'apple_watch'
            ? `${profile?.first_name}'s Apple Watch`
            : `${profile?.first_name}'s Oura Ring`,
        type: deviceType,
        isConnected: true,
      };

      setConnectedDevices((prev) => [...prev, newDevice]);
      setIsConnecting(false);
      setShowWearableSheet(false);

      Alert.alert('Success', `${newDevice.name} connected successfully!`);
    }, 1500);
  };

  const handleSaveWearableSelection = () => {
    setIsEditingWearable(false);
    console.log('ProfileScreen - Wearable selection saved:', selectedDeviceId);
  };

  const handleCancelWearableEdit = () => {
    setIsEditingWearable(false);
    setSelectedDeviceId(null);
  };

  const renderProfileSummaryText = () => {
    if (!profileSummary) {
      return (
        <Text style={styles.sectionValue}>No summary yet. Tap to add one.</Text>
      );
    }

    const boldName = shortName;
    const parts = profileSummary.split(boldName);

    if (parts.length > 1) {
      return (
        <Text style={styles.summaryText}>
          <Text style={styles.summaryBoldName}>{boldName}</Text>
          {parts[1]}
        </Text>
      );
    }

    return <Text style={styles.summaryText}>{profileSummary}</Text>;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <ImageBackground
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require('../../assets/coach-background.png')
            }
            style={styles.heroImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.1)', colors.darkBrown]}
              locations={[0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientOverlay}
            />

            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={colors.offWhite} />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.editPhotoButton, { top: insets.top + 12 }]}
              onPress={handleEditPhoto}
              disabled={isUploadingImage}
            >
              <Image
                source={require('../../assets/profile/pencil.png')}
                style={styles.pencilIcon}
              />
            </TouchableOpacity>

            <Text style={styles.userName}>{fullName}</Text>
          </ImageBackground>
        </View>

        <View style={styles.contentSection}>
          <TouchableOpacity
            style={styles.referFriendsRow}
            onPress={handleReferFriends}
          >
            <Icon name="navigation" size={14} color={colors.yellow} />
            <Text style={styles.referFriendsText}>refer friends</Text>
          </TouchableOpacity>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>summary</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditSummary}
              >
                <Image
                  source={require('../../assets/profile/pencil.png')}
                  style={styles.pencilIcon}
                />
              </TouchableOpacity>
            </View>
            {renderProfileSummaryText()}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>location</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditLocation}
              >
                <Image
                  source={require('../../assets/profile/pencil.png')}
                  style={styles.pencilIcon}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionValue}>{location}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>wearable integration</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditWearable}
              >
                <Image
                  source={require('../../assets/profile/pencil.png')}
                  style={styles.pencilIcon}
                />
              </TouchableOpacity>
            </View>

            {isEditingWearable ? (
              <View style={styles.wearableEditContainer}>
                {connectedDevices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.wearableSelectItem}
                    onPress={() => setSelectedDeviceId(device.id)}
                  >
                    <Text
                      style={[
                        styles.wearableItemText,
                        selectedDeviceId === device.id &&
                          styles.wearableItemTextSelected,
                      ]}
                    >
                      {device.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={handleConnectNewDevice}>
                  <Text style={styles.connectNewDeviceText}>
                    Connect new device
                  </Text>
                </TouchableOpacity>
                <View style={styles.wearableButtonRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveWearableSelection}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelWearableEdit}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {connectedDevices.length > 0 ? (
                  connectedDevices.map((device) => (
                    <Text key={device.id} style={styles.sectionValue}>
                      {device.name}
                    </Text>
                  ))
                ) : (
                  <TouchableOpacity onPress={handleConnectNewDevice}>
                    <Text style={styles.connectNewDeviceText}>
                      Connect new device
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Icon2 name="logout" size={20} color={colors.darkBrown} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showPhotoActionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoActionSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPhotoActionSheet(false)}
          />
          <View style={styles.actionSheetContainer}>
            <View style={styles.actionSheetContent}>
              <Text style={styles.actionSheetTitle}>Change Image</Text>
              <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={() => handlePhotoOption('library')}
              >
                <Text style={styles.actionSheetOptionText}>
                  Choose from library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={() => handlePhotoOption('camera')}
              >
                <Text style={styles.actionSheetOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={() => handlePhotoOption('remove')}
              >
                <Text style={styles.actionSheetOptionTextRed}>
                  Remove current image
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.actionSheetCancelButton}
              onPress={() => setShowPhotoActionSheet(false)}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWearableSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWearableSheet(false)}
      >
        <View style={styles.wearableModalContainer}>
          <TouchableOpacity
            style={styles.wearableModalOverlay}
            activeOpacity={1}
            onPress={() => setShowWearableSheet(false)}
          />
          <View style={[styles.wearableSheetContainer, { bottom: 71 }]}>
            <View style={styles.wearableSheetHandle} />
            <Text style={styles.wearableSheetTitle}>Connect new device</Text>

            {isConnecting ? (
              <View style={styles.connectingContainer}>
                <ActivityIndicator size="large" color={colors.yellow} />
                <Text style={styles.connectingText}>Connecting...</Text>
              </View>
            ) : (
              <View style={styles.wearableOptions}>
                <TouchableOpacity
                  style={styles.wearableOptionButton}
                  onPress={() => handleConnectDevice('apple_watch')}
                >
                  <Text style={styles.wearableOptionText}>Apple Watch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.wearableOptionButton}
                  onPress={() => handleConnectDevice('oura_ring')}
                >
                  <Text style={styles.wearableOptionText}>Oura Ring</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    flexGrow: 1,
  },
  heroSection: {
    width: '100%',
    height: 458,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  editPhotoButton: {
    position: 'absolute',
    right: 24,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  uploadingText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    marginTop: 12,
  },
  userName: {
    fontFamily: 'Bebas Neue',
    fontSize: 75,
    color: 'rgba(248, 249, 250, 0.9)',
    textAlign: 'right',
    paddingRight: 10,
    paddingBottom: 24,
    lineHeight: 77,
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  referFriendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  referFriendsText: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.yellow,
    textTransform: 'uppercase',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.white,
    lineHeight: 51,
    textTransform: 'uppercase',
  },
  editButton: {
    padding: 4,
  },
  pencilIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  sectionValue: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '500',
    color: colors.offWhite,
    lineHeight: 19,
  },
  summaryText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '400',
    color: colors.offWhite,
    lineHeight: 15,
  },
  summaryBoldName: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontWeight: '500',
    color: colors.offWhite,
  },
  wearableEditContainer: {
    marginTop: 8,
  },
  wearableSelectItem: {
    paddingVertical: 8,
  },
  wearableItemText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '500',
    color: colors.offWhite,
    lineHeight: 19,
  },
  wearableItemTextSelected: {
    color: colors.yellow,
  },
  connectNewDeviceText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.gray.muted,
    marginTop: 8,
  },
  wearableButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: colors.yellow,
    borderWidth: 1,
    borderColor: colors.darkBrown,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 107,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.darkBrown,
  },
  cancelButton: {
    backgroundColor: colors.gray.muted,
    borderWidth: 1,
    borderColor: colors.darkBrown,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 107,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.darkBrown,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.beige,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  signOutText: {
    color: colors.darkBrown,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionSheetContainer: {
    paddingHorizontal: 8,
    paddingBottom: 34,
  },
  actionSheetContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionSheetTitle: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '600',
    color: '#3D3D3D',
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128, 128, 128, 0.55)',
  },
  actionSheetOption: {
    paddingVertical: 17,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128, 128, 128, 0.55)',
  },
  actionSheetOptionText: {
    fontFamily: 'Roboto',
    fontSize: 17,
    color: '#007AFF',
    textAlign: 'center',
  },
  actionSheetOptionTextRed: {
    fontFamily: 'Roboto',
    fontSize: 17,
    color: '#FF3B30',
    textAlign: 'center',
  },
  actionSheetCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 17,
  },
  actionSheetCancelText: {
    fontFamily: 'Roboto',
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  wearableModalContainer: {
    flex: 1,
  },
  wearableModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  wearableSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.offWhite,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  wearableSheetHandle: {
    width: 31,
    height: 4,
    backgroundColor: colors.offWhite,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  wearableSheetTitle: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.offWhite,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
    textTransform: 'uppercase',
  },
  wearableOptions: {
    alignItems: 'center',
    gap: 12,
  },
  wearableOptionButton: {
    backgroundColor: colors.yellow,
    borderWidth: 1,
    borderColor: colors.darkBrown,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 107,
    alignItems: 'center',
  },
  wearableOptionText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.darkBrown,
  },
  connectingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  connectingText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    marginTop: 12,
  },
});
