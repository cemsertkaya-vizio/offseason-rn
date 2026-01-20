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

interface Tag {
  label: string;
}

interface WorkoutExerciseCardProps {
  title: string;
  imageSource: ImageSourcePropType;
  tags?: Tag[];
  isCompleted?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  onToggleComplete?: () => void;
}

export const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
  title,
  imageSource,
  tags = [],
  isCompleted = false,
  onPress,
  onRemove,
  onToggleComplete,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={14} color={colors.offWhite} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.checkContainer}
        onPress={onToggleComplete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.checkCircle,
            isCompleted && styles.checkCircleCompleted,
          ]}
        >
          {isCompleted && (
            <Icon name="check" size={12} color={colors.darkBrown} />
          )}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#1A1A1A',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.offWhite,
    minHeight: 92,
    maxHeight: 120,
  },
  imageContainer: {
    width: 147,
    minHeight: 92,
    maxHeight: 120,
    position: 'relative',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.offWhite,
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: colors.offWhite,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  tag: {
    backgroundColor: colors.beige,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: 'Roboto',
    fontSize: 12,
    color: colors.darkBrown,
    lineHeight: 14,
  },
  checkContainer: {
    paddingRight: 14,
    paddingLeft: 8,
    alignSelf: 'flex-start',
    paddingTop: 10,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: colors.offWhite,
    borderColor: colors.offWhite,
  },
});
