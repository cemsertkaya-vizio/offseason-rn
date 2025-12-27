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

interface ScrollPickerProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: T[];
  renderOption?: (option: T) => string;
  unit?: string;
  width?: number;
}

export function ScrollPicker<T>({
  value,
  onChange,
  options,
  renderOption = (option) => String(option),
  unit,
  width = 70,
}: ScrollPickerProps<T>) {
  const flatListRef = useRef<FlatList>(null);

  const initialIndex = Math.max(0, options.indexOf(value));

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
    ({ item, index }: { item: T; index: number }) => {
      const isSelected = item === value;
      const distance = Math.abs(options.indexOf(value) - index);

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
            {renderOption(item)}
          </Text>
        </View>
      );
    },
    [value, options, renderOption]
  );

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={styles.container}>
      <View style={[styles.pickerContainer, { width }]}>
        <FlatList
          ref={flatListRef}
          data={options}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${renderOption(item)}-${index}`}
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
      {unit && <Text style={styles.unitLabel}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
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
    backgroundColor: 'rgba(217, 217, 217, 0.3)',
    borderRadius: 4,
  },
  itemText: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: '400',
    color: colors.offWhite,
    opacity: 0.4,
  },
  selectedValueText: {
    fontSize: 22,
    color: colors.offWhite,
    fontFamily: 'Roboto',
    fontWeight: '400',
  },
  itemTextAdjacent: {
    opacity: 0.4,
  },
  itemTextFar: {
    opacity: 0.4,
  },
  unitLabel: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: '400',
    color: colors.offWhite,
    marginLeft: 8,
  },
});


