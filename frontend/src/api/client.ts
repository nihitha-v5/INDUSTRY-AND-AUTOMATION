import axios from 'axios';

const env = (import.meta as any).env || {};
const customApiUrl = env.VITE_API_URL ? `${env.VITE_API_URL.replace(/\/+$/, '')}/api` : '/api';

export const apiClient = axios.create({
  baseURL: customApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT bearer token if exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Standard Error Response Handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);
