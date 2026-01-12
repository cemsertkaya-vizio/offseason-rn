import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../constants/colors';

const CARD_HEIGHT = 76;
const CARD_GAP = 24;
const CIRCLE_SIZE = 23;
const CIRCLE_CENTER_Y = CARD_HEIGHT / 2;

interface TimelineIndicatorProps {
  isCompleted: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isNextCompleted?: boolean;
}

export const TimelineIndicator: React.FC<TimelineIndicatorProps> = ({
  isCompleted,
  isFirst = false,
  isLast = false,
  isNextCompleted = false,
}) => {
  const lineTopColor = isCompleted ? colors.yellow : colors.offWhite;
  const lineBottomColor = isCompleted && isNextCompleted ? colors.yellow : colors.offWhite;

  return (
    <View style={styles.container}>
      <View style={[styles.lineTop, { backgroundColor: lineTopColor }]} />
      <View
        style={[
          styles.circle,
          isCompleted ? styles.completedCircle : styles.pendingCircle,
        ]}
      >
        {isCompleted && (
          <Icon name="check" size={16} color={colors.darkBrown} />
        )}
      </View>
      {!isLast && (
        <View style={[styles.lineBottom, { backgroundColor: lineBottomColor }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    alignItems: 'center',
    height: CARD_HEIGHT + CARD_GAP,
    marginRight: 23,
  },
  lineTop: {
    position: 'absolute',
    top: 0,
    width: 1,
    height: CIRCLE_CENTER_Y - CIRCLE_SIZE / 2,
  },
  lineBottom: {
    position: 'absolute',
    top: CIRCLE_CENTER_Y + CIRCLE_SIZE / 2,
    bottom: 0,
    width: 1,
  },
  circle: {
    position: 'absolute',
    top: CIRCLE_CENTER_Y - CIRCLE_SIZE / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCircle: {
    backgroundColor: colors.yellow,
  },
  pendingCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.offWhite,
  },
});
