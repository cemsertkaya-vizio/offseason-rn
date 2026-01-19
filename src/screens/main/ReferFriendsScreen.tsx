import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../constants/colors';

export const ReferFriendsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBackPress = () => {
    console.log('ReferFriendsScreen - Back pressed');
    navigation.goBack();
  };

  const handleReferPress = async () => {
    console.log('ReferFriendsScreen - Refer pressed');
    try {
      const result = await Share.share({
        message:
          'Join me on Offseason! The fitness app that helps you train smarter. Sign up now and move up on the waitlist!',
        title: 'Join Offseason',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('ReferFriendsScreen - Shared via:', result.activityType);
        } else {
          console.log('ReferFriendsScreen - Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('ReferFriendsScreen - Share dismissed');
      }
    } catch (error) {
      console.error('ReferFriendsScreen - Share error:', error);
      Alert.alert('Error', 'Unable to share at this time.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={24} color={colors.offWhite} />
        </TouchableOpacity>
        <Text style={styles.title}>refer friends</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.thankYouText}>
          Thanks for sharing us with your friends!
        </Text>
        <Text style={styles.descriptionText}>
          Want in early? Each friend who signs up from your invite moves you
          higher on the waitlist – the more you share, the sooner you'll unlock
          early beta access to our next big release.
        </Text>
      </View>

      <TouchableOpacity style={styles.referButton} onPress={handleReferPress}>
        <Text style={styles.referButtonText}>Refer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBrown,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 27,
    paddingTop: 24,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.offWhite,
    lineHeight: 51,
    textTransform: 'uppercase',
  },
  content: {
    paddingHorizontal: 34,
    marginTop: 8,
  },
  thankYouText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
    lineHeight: 19,
  },
  descriptionText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.offWhite,
    lineHeight: 15,
    marginTop: 4,
  },
  referButton: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.darkBrown,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginTop: 40,
    minWidth: 144,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: colors.darkBrown,
    fontWeight: '400',
  },
});
