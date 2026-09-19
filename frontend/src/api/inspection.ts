import { apiClient } from './client';
import { InspectionResult } from '../types';

export const inspectionApi = {
  predictSingle: async (file: File, stationId?: string, batchId?: string): Promise<InspectionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    if (stationId) formData.append('station_id', stationId);
    if (batchId) formData.append('batch_id', batchId);

    const res = await apiClient.post('/inspection/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  predictBatch: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const res = await apiClient.post('/inspection/batch-predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};
