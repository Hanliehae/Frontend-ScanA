import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inisialisasi TensorFlow
export const initTensorFlow = async () => {
  try {
    await tf.ready();
    console.log('TensorFlow berhasil diinisialisasi');
    return true;
  } catch (error) {
    console.error('Error inisialisasi TensorFlow:', error);
    return false;
  }
};

// Load model dari assets
export const loadModel = async () => {
  try {
    const modelJSON = require('../../../assets/model.json');
    const modelWeights = require('../../../assets/weights.bin');
    const model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights));
    console.log('Model berhasil dimuat');
    return model;
  } catch (error) {
    console.error('Error memuat model:', error);
    return null;
  }
}; 