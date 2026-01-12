import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../constants/colors';

const CARD_HEIGHT = 76;
const CARD_GAP = 24;
const CIRCLE_SIZE = 23;
const CIRCLE_TOP_OFFSET = 26;

interface TimelineIndicatorProps {
  isCompleted: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TimelineIndicator: React.FC<TimelineIndicatorProps> = ({
  isCompleted,
  isFirst = false,
  isLast = false,
}) => {
  return (
    <View style={styles.container}>
      {!isFirst && <View style={styles.lineTop} />}
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
      {!isLast && <View style={styles.lineBottom} />}
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
    width: 1,
    height: CIRCLE_TOP_OFFSET,
    backgroundColor: colors.offWhite,
  },
  lineBottom: {
    width: 1,
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  circle: {
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
