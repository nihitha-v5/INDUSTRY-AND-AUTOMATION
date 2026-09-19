import { apiClient } from './client';
import { SimulationResult } from '../types';

export const simulationApi = {
  runSimulation: async (data: {
    target_station: string;
    simulated_cycle_time: number;
    simulated_capacity?: number;
    downtime_reduction_pct?: number;
  }): Promise<SimulationResult> => {
    const res = await apiClient.post('/simulation/run', data);
    return res.data;
  }
};
