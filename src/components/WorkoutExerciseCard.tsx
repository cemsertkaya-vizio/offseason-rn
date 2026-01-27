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

const editWeightIcon = require('../assets/workouts/workout-edit/ion_barbell-outline.png');
const editSetsIcon = require('../assets/workouts/workout-edit/basil_stack-outline.png');
const editRepsIcon = require('../assets/workouts/workout-edit/edit-reps.png');
const completeIcon = require('../assets/workouts/workout-edit/complete.png');
const deleteIcon = require('../assets/workouts/workout-edit/delete.png');

interface Tag {
  label: string;
}

type ActionType = 'weight' | 'sets' | 'reps' | 'complete' | 'delete' | null;

interface WorkoutExerciseCardProps {
  title: string;
  imageSource: ImageSourcePropType;
  tags?: Tag[];
  isCompleted?: boolean;
  isExpanded?: boolean;
  instructions?: string[];
  activeAction?: ActionType;
  onPress?: () => void;
  onEditWeight?: () => void;
  onEditSets?: () => void;
  onEditReps?: () => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
}

export const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
  title,
  imageSource,
  tags = [],
  isCompleted = false,
  isExpanded = false,
  instructions = [],
  activeAction = null,
  onPress,
  onEditWeight,
  onEditSets,
  onEditReps,
  onToggleComplete,
  onDelete,
}) => {
  if (isExpanded) {
    return (
      <View style={styles.expandedContainer}>
        <TouchableOpacity
          style={styles.expandedHeader}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.expandedHeaderContent}>
            <Text style={styles.expandedTitle}>{title}</Text>
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

        <View style={styles.expandedImageContainer}>
          <Image source={imageSource} style={styles.expandedImage} resizeMode="cover" />
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Icon name="play-arrow" size={32} color={colors.offWhite} />
            </View>
          </View>
        </View>

        {instructions.length > 0 && (
          <View style={styles.instructionsContainer}>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, activeAction === 'weight' && styles.actionButtonActive]} 
            onPress={onEditWeight}
          >
            <Image 
              source={editWeightIcon} 
              style={[styles.actionIcon, activeAction === 'weight' && styles.actionIconActive]} 
            />
            <Text style={[styles.actionButtonText, activeAction === 'weight' && styles.actionButtonTextActive]}>Edit weight</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, activeAction === 'sets' && styles.actionButtonActive]} 
            onPress={onEditSets}
          >
            <Image 
              source={editSetsIcon} 
              style={[styles.actionIcon, activeAction === 'sets' && styles.actionIconActive]} 
            />
            <Text style={[styles.actionButtonText, activeAction === 'sets' && styles.actionButtonTextActive]}>Edit sets</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, activeAction === 'reps' && styles.actionButtonActive]} 
            onPress={onEditReps}
          >
            <Image 
              source={editRepsIcon} 
              style={[styles.actionIcon, activeAction === 'reps' && styles.actionIconActive]} 
            />
            <Text style={[styles.actionButtonText, activeAction === 'reps' && styles.actionButtonTextActive]}>Edit reps</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, activeAction === 'complete' && styles.actionButtonActive]} 
            onPress={onToggleComplete}
          >
            <Image 
              source={completeIcon} 
              style={[styles.actionIcon, activeAction === 'complete' && styles.actionIconActive]} 
            />
            <Text style={[styles.actionButtonText, activeAction === 'complete' && styles.actionButtonTextActive]}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, activeAction === 'delete' && styles.actionButtonActive]} 
            onPress={onDelete}
          >
            <Image 
              source={deleteIcon} 
              style={[styles.actionIcon, activeAction === 'delete' && styles.actionIconActive]} 
            />
            <Text style={[styles.actionButtonText, activeAction === 'delete' && styles.actionButtonTextActive]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
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
  expandedContainer: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.offWhite,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  expandedHeaderContent: {
    flex: 1,
  },
  expandedTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '500',
    color: colors.offWhite,
    lineHeight: 24,
    textTransform: 'capitalize',
  },
  expandedImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.offWhite,
  },
  instructionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
    width: 20,
  },
  instructionText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: colors.offWhite,
    lineHeight: 20,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 60,
  },
  actionButtonActive: {
    backgroundColor: colors.beige,
    borderColor: colors.beige,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.offWhite,
  },
  actionIconActive: {
    tintColor: colors.darkBrown,
  },
  actionButtonText: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: colors.offWhite,
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtonTextActive: {
    color: colors.darkBrown,
  },
});
