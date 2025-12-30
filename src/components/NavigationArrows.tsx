import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface NavigationArrowsProps {
  onBackPress: () => void;
  onNextPress: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  hideBack?: boolean;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onBackPress,
  onNextPress,
  backDisabled = false,
  nextDisabled = false,
  hideBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.arrowsContainer}>
        {!hideBack ? (
          <TouchableOpacity
            style={[styles.arrowButton, backDisabled && styles.arrowButtonDisabled]}
            onPress={onBackPress}
            disabled={backDisabled}
            activeOpacity={0.7}>
            <View style={styles.arrowLeft}>
              <View style={[styles.arrowHead, styles.arrowHeadLeft]} />
              <View style={styles.arrowLine} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.arrowButton, nextDisabled && styles.arrowButtonDisabled]}
          onPress={onNextPress}
          disabled={nextDisabled}
          activeOpacity={0.7}>
          <View style={styles.arrowRight}>
            <View style={styles.arrowLine} />
            <View style={[styles.arrowHead, styles.arrowHeadRight]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 105,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 328,
  },
  arrowButton: {
    width: 51,
    height: 51,
    borderRadius: 25.5,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  placeholder: {
    width: 51,
    height: 51,
  },
  spacer: {
    width: 226,
  },
  arrowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowLine: {
    width: 12,
    height: 2,
    backgroundColor: colors.darkBrown,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
  },
  arrowHeadLeft: {
    borderRightWidth: 6,
    borderRightColor: colors.darkBrown,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginRight: -1,
  },
  arrowHeadRight: {
    borderLeftWidth: 6,
    borderLeftColor: colors.darkBrown,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: -1,
  },
});

