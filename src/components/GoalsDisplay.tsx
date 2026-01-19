import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';
import { formatGoalForDisplay } from '../utils/goalFormatter';
import type { GoalData } from '../types/auth';

interface GoalsDisplayProps {
  goals: GoalData[];
}

export const GoalsDisplay: React.FC<GoalsDisplayProps> = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return null;
  }

  if (goals.length === 1) {
    return <SingleGoalPill goal={goals[0]} />;
  }

  return <MultipleGoalsCard goals={goals} />;
};

interface SingleGoalPillProps {
  goal: GoalData;
}

const SingleGoalPill: React.FC<SingleGoalPillProps> = ({ goal }) => {
  const formatted = formatGoalForDisplay(goal);

  return (
    <View style={styles.pillContainer}>
      <View style={styles.pillContent}>
        <Icon name="target" size={18} color={colors.offWhite} style={styles.pillIcon} />
        <View style={styles.pillTextContainer}>
          <Text style={styles.pillLabel}>goal</Text>
          <Text style={styles.pillGoalText}>{formatted.fullText}</Text>
        </View>
      </View>
    </View>
  );
};

interface MultipleGoalsCardProps {
  goals: GoalData[];
}

const MultipleGoalsCard: React.FC<MultipleGoalsCardProps> = ({ goals }) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardHeader}>my goals</Text>
      {goals.map((goal, index) => {
        const formatted = formatGoalForDisplay(goal);
        const isLast = index === goals.length - 1;
        return (
          <View 
            key={`${goal.type}-${index}`} 
            style={[styles.goalRow, isLast && styles.goalRowLast]}
          >
            <Icon name="target" size={14} color={colors.offWhite} />
            <Text style={styles.goalText}>{formatted.fullText}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    marginTop: 10,
    marginHorizontal: 34,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkBrown,
    borderWidth: 0.7,
    borderColor: colors.offWhite,
    borderRadius: 68,
    height: 53,
    paddingHorizontal: 20,
    shadowColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  pillIcon: {
    marginRight: 10,
  },
  pillTextContainer: {
    flex: 1,
  },
  pillLabel: {
    fontFamily: 'Bebas Neue',
    fontSize: 14,
    color: colors.yellow,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  pillGoalText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
    lineHeight: 29,
    textTransform: 'uppercase',
  },
  cardContainer: {
    marginTop: 10,
    marginHorizontal: 34,
    backgroundColor: colors.darkBrown,
    borderWidth: 0.7,
    borderColor: colors.offWhite,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
    shadowColor: 'rgba(255, 255, 255, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    fontFamily: 'Bebas Neue',
    fontSize: 14,
    color: colors.yellow,
    lineHeight: 22,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  goalRowLast: {
    marginBottom: 0,
  },
  goalText: {
    fontFamily: 'Bebas Neue',
    fontSize: 18,
    color: colors.offWhite,
    lineHeight: 29,
    flex: 1,
    textTransform: 'uppercase',
  },
});
