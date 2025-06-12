// src/services/api.ts
import axios from 'axios';

// Determine the base URL based on the environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: To handle global errors like 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized, redirecting to login...');
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