import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change this to your computer's IP address when testing on physical device
const API_BASE_URL = __DEV__
  ? 'http://192.168.100.114:3000/api'
  : 'http://192.168.100.114:3000/api'; // Replace with your production URL when ready

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    password: string;
    userType?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  changePasswordRequest: async () => {
    const response = await api.post('/auth/change-password/request', {});
    return response.data;
  },

  changePasswordConfirm: async (data: { currentPassword: string; newPassword: string; code: string }) => {
    const response = await api.post('/auth/change-password/confirm', data);
    return response.data;
  },
};

export const wasteAPI = {
  getCategories: async () => {
    const response = await api.get('/waste/categories');
    return response.data;
  },

  createRequest: async (requestData: {
    wasteType: string;
    quantityKg: number;
    description?: string;
    location?: string;
    categoryId: number;
  }) => {
    const response = await api.post('/waste/request', requestData);
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/waste/requests');
    return response.data;
  },

  recognizeWaste: async (wasteDescription: string) => {
    const response = await api.post('/waste/recognize', { wasteDescription });
    return response.data;
  },
};

export const rewardsAPI = {
  getRewards: async () => {
    const response = await api.get('/rewards');
    return response.data;
  },

  getBalance: async () => {
    const response = await api.get('/rewards/balance');
    return response.data;
  },

  redeemReward: async (rewardId: number) => {
    const response = await api.post(`/rewards/redeem/${rewardId}`);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/rewards/history');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData: {
    fullName?: string;
    phone?: string;
    location?: string;
  }) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

export default api;