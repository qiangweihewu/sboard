// src/services/api.ts
import axios from 'axios';

// Determine the base URL based on the environment
// VITE_API_BASE_URL should be defined in .env files (e.g., .env.development, .env.production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // 'X-Requested-With': 'XMLHttpRequest', // Often added for Laravel backends
  },
});

// Request Interceptor: To add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Or however you store your token
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
      // Handle 401 Unauthorized: e.g., redirect to login, clear token
      console.error('Unauthorized, redirecting to login...');
      localStorage.removeItem('authToken'); // Clear token
      // window.location.href = '/login'; // Or use react-router programmatically
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

export const del = <T = any>(url: string) => // 'delete' is a reserved keyword
  apiClient.delete<T>(url);

export default apiClient; // Export the configured instance if needed directly
