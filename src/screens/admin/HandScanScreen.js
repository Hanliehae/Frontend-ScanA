import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Text, IconButton, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { showMessage } from 'react-native-flash-message';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('Camera:', Camera);

const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
const DESIRED_RATIO = '16:9';

const HandScanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { meeting, type } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flash, setFlash] = useState('off');
  const [ratio, setRatio] = useState(DESIRED_RATIO);
  const cameraRef = useRef(null);

  // Request camera permission
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('Camera permission status:', status);
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          showMessage({
            message: 'Izin kamera diperlukan',
            description: 'Aplikasi membutuhkan akses kamera untuk melakukan scan',
            type: 'warning',
          });
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        showMessage({
          message: 'Error',
          description: 'Gagal meminta izin kamera: ' + error.message,
          type: 'danger',
        });
      }
    })();
  }, []);

  // Set optimal camera ratio
  useEffect(() => {
    if (cameraRef.current) {
      (async () => {
        try {
          const supportedRatios = await cameraRef.current.getSupportedRatiosAsync();
          console.log('Supported ratios:', supportedRatios);
          
          if (supportedRatios.includes(DESIRED_RATIO)) {
            setRatio(DESIRED_RATIO);
          } else {
            // Fallback to the first supported ratio
            setRatio(supportedRatios[0]);
          }
        } catch (error) {
          console.error('Error getting supported ratios:', error);
        }
      })();
    }
  }, []);

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'torch' : 'off');
  };

  const preparePhotoUri = async (uri) => {
    try {
      const tempUri = `${FileSystem.cacheDirectory}temp_scan.jpg`;
      await FileSystem.moveAsync({
        from: uri,
        to: tempUri
      });
      return tempUri;
    } catch (error) {
      console.error('Error preparing photo URI:', error);
      throw new Error('Gagal mempersiapkan foto');
    }
  };

  const sendToServer = async (photoUri) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'scan.jpg'
      });
      formData.append('meeting_id', meeting.id);
      formData.append('scan_type', type);

      console.log('Sending to server with data:', {
        meeting_id: meeting.id,
        scan_type: type,
        uri: photoUri
      });

      const response = await api.post('/attendance/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sending to server:', error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      showMessage({
        message: 'Error',
        description: 'Kamera tidak tersedia',
        type: 'danger',
      });
      return;
    }

    if (isProcessing) {
      console.log('Already processing a picture');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Taking picture...');

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });
      console.log('Picture taken:', photo.uri);

      // Prepare photo
      const preparedUri = await preparePhotoUri(photo.uri);
      
      // Send to server
      const response = await sendToServer(preparedUri);

      if (response.success) {
        showMessage({
          message: 'Scan Berhasil',
          description: `Berhasil melakukan scan ${type}`,
          type: 'success',
        });
        navigation.goBack();
      } else {
        throw new Error(response.message || 'Gagal melakukan scan');
      }

    } catch (error) {
      showMessage({
        message: 'Gagal Scan',
        description: error.message || 'Terjadi kesalahan saat melakukan scan',
        type: 'danger',
      });
    } finally {
      setIsProcessing(false);
      // Clean up temporary file
      try {
        const tempUri = `${FileSystem.cacheDirectory}temp_scan.jpg`;
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E5BFF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Tidak ada akses ke kamera</Text>
        <Button 
          mode="contained" 
          onPress={() => Camera.requestCameraPermissionsAsync()}
          style={styles.button}
        >
          Minta Izin Kamera
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.buttonMargin]}
        >
          Kembali
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ratio={ratio}
        flashMode={flash}
        autoFocus={Camera.Constants.AutoFocus.on}
        whiteBalance={Camera.Constants.WhiteBalance.auto}
        onMountError={(error) => {
          console.error('Camera mount error:', error);
          showMessage({
            message: 'Error',
            description: 'Gagal memuat kamera: ' + error.message,
            type: 'danger',
          });
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="#fff"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerText}>
              Scan {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <IconButton
              icon={flash === Camera.Constants.FlashMode.torch ? "flash" : "flash-off"}
              size={24}
              iconColor="#fff"
              onPress={toggleFlash}
              style={styles.flashButton}
            />
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            <Text style={styles.guideText}>
              Posisikan telapak tangan Anda di dalam frame
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled
              ]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#2E5BFF" size={24} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  flashButton: {
    marginLeft: 'auto',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: WINDOW_WIDTH * 0.8,
    height: WINDOW_HEIGHT * 0.4,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2E5BFF',
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2E5BFF',
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#2E5BFF',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2E5BFF',
  },
  guideText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E5BFF',
  },
  button: {
    marginTop: 16,
    width: '80%',
  },
  buttonMargin: {
    marginTop: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default HandScanScreen; 