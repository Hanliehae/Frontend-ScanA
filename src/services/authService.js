import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from './config';

// Ganti dengan IP address komputer Anda yang menjalankan backend
// Untuk development, gunakan IP address komputer Anda di jaringan lokal
// Contoh: 'http://192.168.1.100:8000/api'

// Buat instance axios dengan timeout
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 detik timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

const authService = {
  async login(username, password) {
    try {
      console.log('Attempting login to:', API_URL);
      const response = await api.post('/auth/login', {
        username,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.access_token) {
        // Simpan token
        await AsyncStorage.setItem('token', response.data.access_token);
        
        try {
          // Ambil data user menggunakan token
          const userResponse = await api.get('/user/profile', {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`
            }
          });

          // Simpan data user
          await AsyncStorage.setItem('user', JSON.stringify(userResponse.data));
          
          return {
            access_token: response.data.access_token,
            user: userResponse.data
          };
        } catch (userError) {
          console.error('Error fetching user profile:', userError);
          // Jika gagal ambil profil, hapus token dan throw error
          await AsyncStorage.removeItem('token');
          throw new Error('Failed to fetch user profile');
        }
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection.');
      }
      
      if (!error.response) {
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      
      // Handle error response
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      
      throw new Error('An unexpected error occurred');
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Get token error:', error);
      throw error;
    }
  },

  async getUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
};

export default authService; 