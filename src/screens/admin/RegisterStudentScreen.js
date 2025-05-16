import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';

const RegisterStudentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nim: '',
    name: '',
    email: '',
    phone: '',
    hand_left: null,
    hand_right: null,
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nim) newErrors.nim = 'NIM is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.hand_left) newErrors.hand_left = 'Left hand image is required';
    if (!formData.hand_right) newErrors.hand_right = 'Right hand image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (hand) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        [hand]: {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `${hand}.jpg`,
        },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nim', formData.nim);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('hand_left', formData.hand_left);
      formDataToSend.append('hand_right', formData.hand_right);

      const response = await api.post('/auth/register-student', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showMessage({
        message: 'Student registered successfully',
        description: `Username: ${response.data.credentials.username}\nPassword: ${response.data.credentials.password}`,
        type: 'success',
      });

      navigation.goBack();
    } catch (error) {
      showMessage({
        message: 'Registration failed',
        description: error.response?.data?.message || 'An error occurred',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register New Student</Text>
      
      <TextInput
        label="NIM"
        value={formData.nim}
        onChangeText={(text) => setFormData(prev => ({ ...prev, nim: text }))}
        error={!!errors.nim}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.nim}>
        {errors.nim}
      </HelperText>

      <TextInput
        label="Name"
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        error={!!errors.name}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
        error={!!errors.email}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email}
      </HelperText>

      <TextInput
        label="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
        error={!!errors.phone}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.phone}>
        {errors.phone}
      </HelperText>

      <View style={styles.imageContainer}>
        <View style={styles.imageButtonContainer}>
          <Button
            mode="contained"
            onPress={() => pickImage('hand_left')}
            style={styles.imageButton}
          >
            Upload Left Hand
          </Button>
          {formData.hand_left && (
            <Text style={styles.imageText}>Image selected</Text>
          )}
          <HelperText type="error" visible={!!errors.hand_left}>
            {errors.hand_left}
          </HelperText>
        </View>

        <View style={styles.imageButtonContainer}>
          <Button
            mode="contained"
            onPress={() => pickImage('hand_right')}
            style={styles.imageButton}
          >
            Upload Right Hand
          </Button>
          {formData.hand_right && (
            <Text style={styles.imageText}>Image selected</Text>
          )}
          <HelperText type="error" visible={!!errors.hand_right}>
            {errors.hand_right}
          </HelperText>
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      >
        Register Student
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  imageContainer: {
    marginVertical: 16,
  },
  imageButtonContainer: {
    marginBottom: 16,
  },
  imageButton: {
    marginBottom: 8,
  },
  imageText: {
    textAlign: 'center',
    color: 'green',
  },
  submitButton: {
    marginTop: 24,
  },
});

export default RegisterStudentScreen; 