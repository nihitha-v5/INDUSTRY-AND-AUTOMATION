import { apiClient } from './client';
import { ModelEntry } from '../types';

export const modelsApi = {
  list: async (): Promise<ModelEntry[]> => {
    const res = await apiClient.get('/models');
    return res.data;
  },
  upload: async (formData: FormData): Promise<ModelEntry> => {
    const res = await apiClient.post('/models/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  activate: async (modelId: number) => {
    const res = await apiClient.post(`/models/${modelId}/activate`);
    return res.data;
  }
};
