import { apiClient } from './client';
import { RecommendationCard } from '../types';

export const recommendationsApi = {
  getRecommendations: async (datasetId?: number): Promise<{ total_recommendations: number; items: RecommendationCard[] }> => {
    const params = datasetId ? { dataset_id: datasetId } : {};
    const res = await apiClient.get('/recommendations', { params });
    return res.data;
  },
  downloadReport: (format: string = 'html', datasetId?: number) => {
    let url = `/api/reports/download?format=${format}`;
    if (datasetId) {
        url += `&dataset_id=${datasetId}`;
    }
    window.open(url, '_blank');
  }
};
