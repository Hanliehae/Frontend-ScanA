import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('Camera:', Camera);

// Menggunakan URL yang sama dengan authService.js
const API_URL = 'http://192.168.25.39:8000/api';

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const processPalmImage = async (imageUri) => {
    try {
      // Baca file gambar dan konversi ke base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const base64data = reader.result.split(',')[1];
          
          try {
            // Kirim ke endpoint deteksi
            const detectResponse = await axios.post(`${API_URL}/detect`, {
              image: base64data
            });

            if (detectResponse.data.isPalm) {
              // Jika terdeteksi sebagai telapak tangan, proses presensi
              const attendanceResponse = await axios.post(`${API_URL}/attendance`, {
                timestamp: detectResponse.data.timestamp,
                confidence: detectResponse.data.confidence
              });

              resolve({
                success: true,
                message: attendanceResponse.data.message,
                data: attendanceResponse.data.data
              });
            } else {
              resolve({
                success: false,
                message: 'Telapak tangan tidak terdeteksi dengan jelas. Silakan coba lagi.'
              });
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        
        // Ambil gambar
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });
        
        // Proses gambar
        const result = await processPalmImage(photo.uri);
        
        if (result.success) {
          Alert.alert(
            'Success',
            result.message,
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('HistoryTab')
              }
            ]
          );
        } else {
          Alert.alert('Error', result.message);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Gagal memproses scan telapak tangan');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAttendance = async (imageData) => {
    try {
      // Get current user data from auth context
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'User data not found. Please login again.');
        return;
      }
      const { id: studentId } = JSON.parse(userData);

      // Get current meeting ID from navigation params or context
      const currentMeetingId = route.params?.meetingId;
      if (!currentMeetingId) {
        Alert.alert('Error', 'Meeting ID not found. Please try again.');
        return;
      }

      // Send to attendance endpoint
      const attendanceResponse = await axios.post(`${API_URL}/attendance`, {
        meeting_id: currentMeetingId,
        student_id: studentId,
        type: 'in' // or 'out' depending on your logic
      });

      if (attendanceResponse.data.status === 'success') {
        Alert.alert(
          'Berhasil',
          'Kehadiran berhasil dicatat',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('HistoryTab')
            }
          ]
        );
      } else {
        throw new Error(attendanceResponse.data.error || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('Attendance Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Gagal mencatat kehadiran'
      );
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Meminta izin kamera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Tidak ada akses ke kamera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <Text style={styles.instructionText}>Letakkan telapak tangan dalam bingkai</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={takePicture}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Memproses...' : 'Scan Telapak Tangan'}
          </Text>
        </TouchableOpacity>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ScanScreen; 