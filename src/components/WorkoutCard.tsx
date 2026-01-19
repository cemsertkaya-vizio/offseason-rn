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

type CardPosition = 'full' | 'left' | 'right';

interface WorkoutCardProps {
  day: string;
  title: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
  position?: CardPosition;
  showDay?: boolean;
  showArrow?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  day,
  title,
  imageSource,
  onPress,
  position = 'full',
  showDay = true,
  showArrow = true,
}) => {
  const getContainerStyle = () => {
    switch (position) {
      case 'left':
        return styles.cardContainerLeft;
      case 'right':
        return styles.cardContainerRight;
      default:
        return styles.cardContainer;
    }
  };

  const getImageStyle = () => {
    switch (position) {
      case 'left':
        return styles.cardImageLeft;
      case 'right':
        return styles.cardImageRight;
      default:
        return styles.cardImage;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={getContainerStyle()}
    >
      <Image
        source={imageSource}
        style={getImageStyle()}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        {showDay && <Text style={styles.dayText}>{day.toUpperCase()}</Text>}
        <Text style={[styles.titleText, !showDay && styles.titleTextNoDay]}>
          {title.toUpperCase()}
        </Text>
      </View>
      {showArrow && (
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={24} color={colors.offWhite} />
        </View>
      )}
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
  cardContainerLeft: {
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
  cardContainerRight: {
    height: 76,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.offWhite,
    borderLeftWidth: 0,
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
  cardImageLeft: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    opacity: 0.9,
  },
  cardImageRight: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
  titleTextNoDay: {
    marginTop: 24,
  },
  arrowContainer: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
