import { apiClient } from './client';
import { Dataset, DataQualityReport } from '../types';

export const datasetsApi = {
  list: async (): Promise<Dataset[]> => {
    const res = await apiClient.get('/datasets');
    return res.data;
  },
  getById: async (id: number): Promise<Dataset> => {
    const res = await apiClient.get(`/datasets/${id}`);
    return res.data;
  },
  upload: async (formData: FormData): Promise<Dataset> => {
    const res = await apiClient.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  validate: async (id: number): Promise<DataQualityReport> => {
    const res = await apiClient.post(`/datasets/${id}/validate`);
    return res.data;
  },
  mapColumns: async (id: number, mappings: { column_name: string; semantic_role: string }[]) => {
    const res = await apiClient.post(`/datasets/${id}/map-columns`, { mappings });
    return res.data;
  },
  process: async (id: number) => {
    const res = await apiClient.post(`/datasets/${id}/process`);
    return res.data;
  }
};
