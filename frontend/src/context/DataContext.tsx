import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dataset } from '../types';
import { datasetsApi } from '../api/datasets';

interface DataContextType {
  activeDataset: Dataset | null;
  datasets: Dataset[];
  isDemoMode: boolean;
  refreshDatasets: () => Promise<void>;
  selectDataset: (dataset: Dataset) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);

  const refreshDatasets = async () => {
    try {
      const list = await datasetsApi.list();
      setDatasets(list);
      if (list.length > 0 && !activeDataset) {
        const demoOrActive = list.find(d => d.is_active) || list[0];
        setActiveDataset(demoOrActive);
      }
    } catch (err) {
      console.warn("Could not fetch datasets list from backend. Using demo fallback mode.");
    }
  };

  useEffect(() => {
    refreshDatasets();
  }, []);

  const selectDataset = (dataset: Dataset) => {
    setActiveDataset(dataset);
  };

  const isDemoMode = activeDataset ? activeDataset.is_demo : true;

  return (
    <DataContext.Provider value={{ activeDataset, datasets, isDemoMode, refreshDatasets, selectDataset }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
