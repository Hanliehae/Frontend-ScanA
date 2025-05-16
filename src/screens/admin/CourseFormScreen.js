import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, RadioButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CourseFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isEdit = route.params?.course;
  const onAdd = route.params?.onAdd;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academic_year: '',
    semester: 'ganjil',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        name: isEdit.name,
        code: isEdit.course_id,
        academic_year: isEdit.academic_year || '',
        semester: isEdit.semester || 'ganjil',
      });
    }
  }, [isEdit]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Nama mata kuliah harus diisi';
    if (!formData.code) newErrors.code = 'Kode mata kuliah harus diisi';
    if (!formData.academic_year) newErrors.academic_year = 'Tahun akademik harus diisi';
    if (!formData.semester) newErrors.semester = 'Semester harus dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const courseData = {
        name: formData.name,
        course_id: formData.code,
        academic_year: formData.academic_year,
        semester: formData.semester,
      };

      if (isEdit) {
        await api.put(`/courses/${isEdit.id}`, courseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showMessage({
          message: 'Success',
          description: 'Mata kuliah berhasil diperbarui',
          type: 'success',
        });
      } else {
        await api.post('/courses', courseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showMessage({
          message: 'Success',
          description: 'Mata kuliah berhasil ditambahkan',
          type: 'success',
        });
      }

      if (onAdd) {
        onAdd();
      }
      navigation.goBack();
    } catch (err) {
      showMessage({
        message: 'Error',
        description: err.message || 'Terjadi kesalahan saat menyimpan data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Nama Mata Kuliah"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={!!errors.name}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <TextInput
        label="Kode Mata Kuliah"
        value={formData.code}
        onChangeText={(text) => setFormData({ ...formData, code: text })}
        error={!!errors.code}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.code}>
        {errors.code}
      </HelperText>

      <TextInput
        label="Tahun Akademik"
        value={formData.academic_year}
        onChangeText={(text) => setFormData({ ...formData, academic_year: text })}
        error={!!errors.academic_year}
        style={styles.input}
        placeholder="Contoh: 2023/2024"
      />
      <HelperText type="error" visible={!!errors.academic_year}>
        {errors.academic_year}
      </HelperText>

      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Semester</Text>
        <RadioButton.Group
          onValueChange={(value) => setFormData({ ...formData, semester: value })}
          value={formData.semester}
        >
          <View style={styles.radioOption}>
            <RadioButton value="ganjil" />
            <Text>Ganjil</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="genap" />
            <Text>Genap</Text>
          </View>
        </RadioButton.Group>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
      >
        {isEdit ? 'Update Mata Kuliah' : 'Tambah Mata Kuliah'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default CourseFormScreen; 