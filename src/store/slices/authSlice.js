import { createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Mock data for testing
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    name: 'Admin User',
  },
  {
    id: 2,
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    name: 'Student User',
  },
];

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

export const login = (username, password) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await authService.login(username, password);
    dispatch(loginSuccess(response));
  } catch (error) {
    const errorMessage = error.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await authService.logout();
    dispatch(logout());
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export default authSlice.reducer; 