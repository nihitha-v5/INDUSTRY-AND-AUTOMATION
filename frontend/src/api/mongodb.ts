import { apiClient } from './client';

export interface MongoStatusResponse {
  status: 'connected' | 'not_configured' | 'error';
  database?: string;
  collections?: string[];
  message: string;
}

export interface MongoSyncResponse {
  status: string;
  synced_count: number;
  collection: string;
  message: string;
}

export const mongodbApi = {
  getStatus: async (): Promise<MongoStatusResponse> => {
    const res = await apiClient.get<MongoStatusResponse>('/mongodb/status');
    return res.data;
  },

  syncInspections: async (): Promise<MongoSyncResponse> => {
    const res = await apiClient.post<MongoSyncResponse>('/mongodb/sync-inspections');
    return res.data;
  },

  getLogs: async (limit: number = 20) => {
    const res = await apiClient.get(`/mongodb/logs?limit=${limit}`);
    return res.data;
  }
};
