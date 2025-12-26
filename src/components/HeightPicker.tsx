import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../constants/colors';

interface HeightPickerProps {
  value?: { feet: number; inches: number } | null;
  onChange?: (value: { feet: number; inches: number } | null) => void;
  width?: number;
  style?: ViewStyle;
}

export const HeightPicker: React.FC<HeightPickerProps> = ({
  value,
  onChange,
  width = 304,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFeet, setTempFeet] = useState(value?.feet ?? 5);
  const [tempInches, setTempInches] = useState(value?.inches ?? 0);

  const handleOpen = () => {
    setTempFeet(value?.feet ?? 5);
    setTempInches(value?.inches ?? 0);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    onChange?.({ feet: tempFeet, inches: tempInches });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const displayValue = value ? `${value.feet}'${value.inches}''` : '';

  return (
    <View style={[styles.container, { width }, style]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handleOpen}
        activeOpacity={0.7}>
        <Text style={[styles.displayText, !displayValue && styles.placeholder]}>
          {displayValue || 'Height'}
        </Text>
      </TouchableOpacity>
      <View style={[styles.underline, { width }]} />

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalInner}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Height</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={tempFeet}
                    onValueChange={setTempFeet}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}>
                    {Array.from({ length: 6 }, (_, i) => i + 3).map((ft) => (
                      <Picker.Item
                        key={ft}
                        label={`${ft} ft`}
                        value={ft}
                        color="#000000"
                      />
                    ))}
                  </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={tempInches}
                    onValueChange={setTempInches}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}>
                    {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
                      <Picker.Item
                        key={inch}
                        label={`${inch} in`}
                        value={inch}
                        color="#000000"
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    height: 65,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  touchable: {
    width: '100%',
    height: 65,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  displayText: {
    fontFamily: 'Roboto',
    fontSize: 27,
    fontWeight: '400',
    color: colors.offWhite,
    textAlign: 'left',
    includeFontPadding: false,
  },
  placeholder: {
    color: 'rgba(248, 249, 250, 0.5)',
  },
  underline: {
    height: 1,
    backgroundColor: 'rgba(248, 249, 250, 0.5)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalInner: {
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  pickerItem: {
    fontSize: 22,
    color: '#000000',
  },
});
