import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../constants/colors';

interface WorkoutCardProps {
  day: string;
  title: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  day,
  title,
  imageSource,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <Image
        source={imageSource}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Text style={styles.dayText}>{day.toUpperCase()}</Text>
        <Text style={styles.titleText}>{title.toUpperCase()}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Icon name="chevron-right" size={24} color={colors.offWhite} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 76,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.offWhite,
    borderRightWidth: 0,
    position: 'relative',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    opacity: 0.9,
  },
  contentContainer: {
    position: 'absolute',
    top: 9,
    left: 14,
  },
  dayText: {
    fontFamily: 'Bebas Neue',
    fontSize: 16,
    color: colors.offWhite,
    lineHeight: 25.6,
  },
  titleText: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: colors.offWhite,
    lineHeight: 51.2,
    marginTop: -3,
  },
  arrowContainer: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
