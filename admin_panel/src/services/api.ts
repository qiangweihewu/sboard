// src/services/api.ts
import axios from 'axios';

// Determine the base URL based on the environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

console.log('🌐 API Client initializing with base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: To add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('📤 Adding auth token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('📤 No auth token for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: To handle global errors like 401
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Response error:', error.config?.url, error.response?.status, error.message);
    if (error.response && error.response.status === 401) {
      console.error('🚫 Unauthorized, redirecting to login...');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic request functions
export const get = <T = any>(url: string, params?: object) =>
  apiClient.get<T>(url, { params });

export const post = <T = any>(url: string, data: any) =>
  apiClient.post<T>(url, data);

export const put = <T = any>(url: string, data: any) =>
  apiClient.put<T>(url, data);

export const del = <T = any>(url: string) =>
  apiClient.delete<T>(url);

export default apiClient;