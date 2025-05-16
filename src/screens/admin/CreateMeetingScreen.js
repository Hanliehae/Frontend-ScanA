import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

const CreateMeetingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { class_ } = route.params;

  const [formData, setFormData] = useState({
    class_id: class_.id || '',
    date: '',
    startTime: '',
    endTime: '',
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Tanggal harus diisi';
    if (!formData.startTime) newErrors.startTime = 'Waktu mulai harus diisi';
    if (!formData.endTime) newErrors.endTime = 'Waktu selesai harus diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = date => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const formatTime = date => date.toTimeString().slice(0, 5); // HH:MM

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await api.post('/meetings/create', {
          class_id: formData.class_id,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 201) {
          navigation.goBack();
        } else {
          showMessage({ message: 'Gagal membuat pertemuan', type: 'danger' });
        }
      } catch (err) {
        showMessage({ message: 'Terjadi kesalahan', type: 'danger' });
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="Tanggal"
          value={formData.date}
          onFocus={() => setShowDatePicker(true)}
          showSoftInputOnFocus={false}
          error={!!errors.date}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.date}>
          {errors.date}
        </HelperText>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, date: formatDate(selectedDate) });
              }
            }}
          />
        )}

        <TextInput
          label="Waktu Mulai"
          value={formData.startTime}
          onFocus={() => setShowStartTimePicker(true)}
          showSoftInputOnFocus={false}
          error={!!errors.startTime}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.startTime}>
          {errors.startTime}
        </HelperText>
        {showStartTimePicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowStartTimePicker(false);
              if (selectedTime) {
                setFormData({ ...formData, startTime: formatTime(selectedTime) });
              }
            }}
          />
        )}

        <TextInput
          label="Waktu Selesai"
          value={formData.endTime}
          onFocus={() => setShowEndTimePicker(true)}
          showSoftInputOnFocus={false}
          error={!!errors.endTime}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.endTime}>
          {errors.endTime}
        </HelperText>
        {showEndTimePicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowEndTimePicker(false);
              if (selectedTime) {
                setFormData({ ...formData, endTime: formatTime(selectedTime) });
              }
            }}
          />
        )}

        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          Buat Pertemuan
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 16 },
  input: { marginBottom: 8, backgroundColor: 'white' },
  button: { marginTop: 16 },
});

export default CreateMeetingScreen;
