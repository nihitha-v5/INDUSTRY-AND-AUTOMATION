import { apiClient } from './client';
import { DashboardSummary, RootCauseData, BottleneckData, EconomicsData } from '../types';

export const analyticsApi = {
  getDashboardSummary: async (datasetId?: number): Promise<DashboardSummary> => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const res = await apiClient.get('/dashboard/summary', { params });
    return res.data;
  },
  getRootCause: async (datasetId?: number): Promise<RootCauseData> => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const res = await apiClient.get('/analysis/root-cause', { params });
    return res.data;
  },
  getBottlenecks: async (datasetId?: number): Promise<BottleneckData> => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const res = await apiClient.get('/analysis/bottlenecks', { params });
    return res.data;
  },
  getEconomics: async (datasetId?: number): Promise<EconomicsData> => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const res = await apiClient.get('/analysis/economics', { params });
    return res.data;
  }
};
