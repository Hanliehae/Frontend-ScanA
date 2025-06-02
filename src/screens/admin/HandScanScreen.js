import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import API_URL from '../../services/config';

const { width: screenWidth } = Dimensions.get('window');
const CAMERA_SIZE = screenWidth - 40; // 20px padding on each side

const HandScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const route = useRoute();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);

  // Get course_id from route params
  const meetingId = route.params?.meetingId;
  const scanType = route.params?.scanType;
  console.log('Scan type:', scanType);

  const isPermissionGranted = Boolean(permission?.granted);

  useEffect(() => {
    if (!isPermissionGranted) {
      requestPermission();
    }
  }, [isPermissionGranted]);

  const handleCapture = async () => {
    if (isScanning || !cameraRef.current) {
      console.log('Already scanning or camera not ready');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      console.log('Starting capture process');

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
        skipProcessing: true,
      });
      console.log('Photo captured');

      // Create temporary file
      const tempFilePath = `${FileSystem.cacheDirectory}temp_scan.jpg`;
      await FileSystem.writeAsStringAsync(tempFilePath, photo.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Temp file created at:', tempFilePath);

      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: tempFilePath,
        type: 'image/jpeg',
        name: 'scan.jpg',
      });
      formData.append('meeting_id', meetingId);
      formData.append('scan_type', scanType);

      console.log('Sending request to backend...');
      // Send to backend
      const response = await axios.post(`${API_URL}/scan-hand`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response received:', response.data);

      // Clean up temp file
      await FileSystem.deleteAsync(tempFilePath);
      console.log('Temp file deleted');

      if (response.data.success) {
        setScanResult(response.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses scan tangan');
    } finally {
      setIsScanning(false);
      setTimeout(() => {
        setError(null);
        setScanResult(null);
      }, 5000);
    }
  };

  if (!meetingId) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Meeting ID tidak ditemukan</Text>
      </View>
    );
  }

  if (isPermissionGranted === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Tidak ada akses kamera</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Izinkan Akses Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing='back'
          enableTorch={false}
          enableZoomGesture={false}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <Text style={styles.scanText}>
              {isScanning ? 'Memindai...' : 'Posisikan tangan dalam area'}
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {scanResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                {scanResult.message}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.captureButton, isScanning && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isScanning}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: -50,
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  errorContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  resultContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,255,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultSubText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  }
});

export default HandScanScreen; 