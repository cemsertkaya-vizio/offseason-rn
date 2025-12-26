import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewToken,
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
  const flatListRef = useRef<FlatList>(null);

  const weights: number[] = [];
  for (let i = minValue; i <= maxValue; i += step) {
    weights.push(i);
  }

  const initialIndex = Math.max(0, weights.indexOf(value));

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const middleItem = viewableItems[Math.floor(viewableItems.length / 2)];
        if (middleItem && middleItem.item !== undefined) {
          onChange(middleItem.item);
        }
      }
    },
    [onChange]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      const isSelected = item === value;
      const distance = Math.abs(weights.indexOf(value) - index);

      return (
        <View style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}>
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
    },
    [value, weights]
  );

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <FlatList
          ref={flatListRef}
          data={weights}
          renderItem={renderItem}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          extraData={value}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT,
          }}
        />
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

