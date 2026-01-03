import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
  const isScrollReady = useRef(false);
  const hasInitialized = useRef(false);

  const initialIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    const timer = setTimeout(() => {
      isScrollReady.current = true;
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasInitialized.current && flatListRef.current) {
      hasInitialized.current = true;
      flatListRef.current.scrollToOffset({
        offset: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [initialIndex]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isScrollReady.current) {
        return;
      }
      
      const offsetY = event.nativeEvent.contentOffset.y;
      const selectedIndex = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(selectedIndex, options.length - 1));
      
      if (options[clampedIndex] !== value) {
        onChange(options[clampedIndex]);
      }
    },
    [onChange, options, value]
  );

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
          getItemLayout={getItemLayout}
          initialScrollIndex={initialIndex}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
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


