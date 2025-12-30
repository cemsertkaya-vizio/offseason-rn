import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { colors } from '../constants/colors';

const ITEM_HEIGHT = 30;
const VISIBLE_ITEMS = 3;

interface WeightPickerProps {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
}

export const WeightPicker: React.FC<WeightPickerProps> = ({
  value,
  onChange,
  minValue = 0,
  maxValue = 500,
  step = 5,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const weights: number[] = [];
  for (let i = minValue; i <= maxValue; i += step) {
    weights.push(i);
  }

  const initialIndex = Math.max(0, weights.indexOf(value));

  useEffect(() => {
    if (scrollViewRef.current && !isScrolling) {
      const index = weights.indexOf(value);
      if (index !== -1) {
        scrollViewRef.current.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }
    }
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!event || !event.nativeEvent || !event.nativeEvent.contentOffset) {
        return;
      }

      const yOffset = event.nativeEvent.contentOffset.y;

      setIsScrolling(true);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        const index = Math.round(yOffset / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, weights.length - 1));
        
        if (weights[clampedIndex] !== undefined && weights[clampedIndex] !== value) {
          onChange(weights[clampedIndex]);
        }
        
        setIsScrolling(false);
      }, 100);
    },
    [weights, onChange, value]
  );

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT,
          }}
        >
          {weights.map((item, index) => {
            const isSelected = item === value;
            const distance = Math.abs(weights.indexOf(value) - index);

            return (
              <View
                key={item.toString()}
                style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
              >
                <Text
                  style={
                    isSelected
                      ? styles.selectedValueText
                      : distance === 1
                      ? [styles.itemText, styles.itemTextAdjacent]
                      : [styles.itemText, styles.itemTextFar]
                  }
                >
                  {item}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Text style={styles.unitLabel}>lbs</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 70,
    overflow: 'hidden',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  itemContainerSelected: {
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  itemText: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(142, 138, 137, 0.6)',
  },
  itemTextSelected: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  selectedValueText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontWeight: '400',
  },
  itemTextAdjacent: {
    color: 'rgba(142, 138, 137, 0.6)',
  },
  itemTextFar: {
    color: 'rgba(142, 138, 137, 0.4)',
  },
  selectedIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(217, 217, 217, 0.3)',
    borderRadius: 4,
  },
  unitLabel: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginLeft: 8,
  },
});

