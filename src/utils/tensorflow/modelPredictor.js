import * as tf from '@tensorflow/tfjs';
import { loadModel } from './tensorflowInit';

// Fungsi untuk memproses gambar sebelum prediksi
export const preprocessImage = async (imageData) => {
  try {
    // Konversi gambar ke tensor
    const imageTensor = tf.browser.fromPixels(imageData);
    
    // Resize gambar sesuai kebutuhan model (contoh: 224x224)
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
    
    // Normalisasi pixel values ke range [0,1]
    const normalized = resized.div(255.0);
    
    // Tambahkan batch dimension
    const batched = normalized.expandDims(0);
    
    return batched;
  } catch (error) {
    console.error('Error preprocessing gambar:', error);
    return null;
  }
};

// Fungsi untuk melakukan prediksi
export const predict = async (imageData) => {
  try {
    // Load model
    const model = await loadModel();
    if (!model) {
      throw new Error('Model tidak berhasil dimuat');
    }

    // Preprocess gambar
    const processedImage = await preprocessImage(imageData);
    if (!processedImage) {
      throw new Error('Gagal memproses gambar');
    }

    // Lakukan prediksi
    const prediction = await model.predict(processedImage);
    
    // Bersihkan memory
    tf.dispose([processedImage, prediction]);
    
    return prediction;
  } catch (error) {
    console.error('Error melakukan prediksi:', error);
    return null;
  }
}; 