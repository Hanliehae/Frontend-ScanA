import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { initTensorFlow } from '../utils/tensorflow/tensorflowInit';
import { predict } from '../utils/tensorflow/modelPredictor';

const TensorFlowScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeTensorFlow();
  }, []);

  const initializeTensorFlow = async () => {
    try {
      setIsLoading(true);
      const initialized = await initTensorFlow();
      if (!initialized) {
        throw new Error('Gagal menginisialisasi TensorFlow');
      }
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleImagePrediction = async (imageData) => {
    try {
      setIsLoading(true);
      const result = await predict(imageData);
      if (result) {
        setPrediction(result);
      } else {
        throw new Error('Prediksi gagal');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Memuat model...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TensorFlow Model Demo</Text>
      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Hasil Prediksi: {JSON.stringify(prediction)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  resultText: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default TensorFlowScreen; 