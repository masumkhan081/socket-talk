// abc
// src/services/api.ts
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Reusable API handlers
export const apiHandler = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get<T>(url, config).then(handleResponse),
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> =>
    api.post<T, AxiosResponse<T>, D>(url, data, config).then(handleResponse),
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> =>
    api.put<T, AxiosResponse<T>, D>(url, data, config).then(handleResponse),
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete<T>(url, config).then(handleResponse),
  patch: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> =>
    api.patch<T, AxiosResponse<T>, D>(url, data, config).then(handleResponse),
};

// Handle response
const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.message || 'Something went wrong');
  }
);

export default api;