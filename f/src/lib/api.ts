import axios from 'axios';
import type { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response as { 
        status: number; 
        data: { message?: string } 
      };
      
      // Handle 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Show error message
      const errorMessage = data?.message || 'Something went wrong';
      toast.error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
