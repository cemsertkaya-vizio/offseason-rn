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

interface GenderPickerProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  width?: number;
  style?: ViewStyle;
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
];

export const GenderPicker: React.FC<GenderPickerProps> = ({
  value,
  onChange,
  width = 304,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  const handleOpen = () => {
    setTempValue(value || '');
    setIsOpen(true);
  };

  const handleConfirm = () => {
    onChange?.(tempValue || null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const displayValue = value
    ? GENDER_OPTIONS.find((opt) => opt.value === value)?.label || ''
    : '';

  return (
    <View style={[styles.container, { width }, style]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handleOpen}
        activeOpacity={0.7}>
        <Text style={[styles.displayText, !displayValue && styles.placeholder]}>
          {displayValue || 'Gender'}
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
                <Text style={styles.modalTitle}>Select Gender</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tempValue}
                  onValueChange={setTempValue}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  <Picker.Item label="Select gender" value="" color="#999999" />
                  {GENDER_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color="#000000"
                    />
                  ))}
                </Picker>
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
    fontSize: 22,
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
    width: '100%',
    paddingBottom: 20,
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
