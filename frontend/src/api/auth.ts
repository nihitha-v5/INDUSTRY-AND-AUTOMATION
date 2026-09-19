import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, full_name: string, password: string, role?: string) => {
    const res = await apiClient.post('/auth/register', { email, full_name, password, role });
    return res.data;
  }
};
