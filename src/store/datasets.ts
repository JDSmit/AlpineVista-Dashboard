import { create } from 'zustand';
import { Dataset, FacilityPeriod } from '@/lib/schema';
import { StorageManager } from '@/lib/storage';

interface DatasetsState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  isLoading: boolean;
  error: string | null;
}

interface DatasetsActions {
  loadDatasets: () => void;
  setCurrentDataset: (datasetId: string) => void;
  addDataset: (dataset: Dataset) => void;
  updateDataset: (datasetId: string, updates: Partial<Dataset>) => void;
  deleteDataset: (datasetId: string) => void;
  addPeriods: (datasetId: string, periods: FacilityPeriod[]) => void;
  clearError: () => void;
}

export const useDatasetsStore = create<DatasetsState & DatasetsActions>((set, get) => ({
  datasets: [],
  currentDataset: null,
  isLoading: false,
  error: null,

  loadDatasets: () => {
    set({ isLoading: true, error: null });
    try {
      const datasets = StorageManager.loadDatasets();
      set({ datasets, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load datasets',
        isLoading: false 
      });
    }
  },

  setCurrentDataset: (datasetId: string) => {
    const { datasets } = get();
    const dataset = datasets.find(d => d.id === datasetId);
    set({ currentDataset: dataset || null });
  },

  addDataset: (dataset: Dataset) => {
    const { datasets } = get();
    const updatedDatasets = [...datasets, dataset];
    
    try {
      StorageManager.saveDatasets(updatedDatasets);
      set({ datasets: updatedDatasets });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save dataset'
      });
    }
  },

  updateDataset: (datasetId: string, updates: Partial<Dataset>) => {
    const { datasets } = get();
    const updatedDatasets = datasets.map(dataset => 
      dataset.id === datasetId 
        ? { ...dataset, ...updates, updatedAt: new Date() }
        : dataset
    );
    
    try {
      StorageManager.saveDatasets(updatedDatasets);
      set({ 
        datasets: updatedDatasets,
        currentDataset: get().currentDataset?.id === datasetId 
          ? updatedDatasets.find(d => d.id === datasetId) || null
          : get().currentDataset
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update dataset'
      });
    }
  },

  deleteDataset: (datasetId: string) => {
    const { datasets } = get();
    const updatedDatasets = datasets.filter(d => d.id !== datasetId);
    
    try {
      StorageManager.saveDatasets(updatedDatasets);
      set({ 
        datasets: updatedDatasets,
        currentDataset: get().currentDataset?.id === datasetId ? null : get().currentDataset
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete dataset'
      });
    }
  },

  addPeriods: (datasetId: string, periods: FacilityPeriod[]) => {
    const { datasets } = get();
    const updatedDatasets = datasets.map(dataset => {
      if (dataset.id === datasetId) {
        const existingPeriods = dataset.periods;
        const newPeriods = periods.filter(newPeriod => 
          !existingPeriods.some(existing => existing.period === newPeriod.period)
        );
        return {
          ...dataset,
          periods: [...existingPeriods, ...newPeriods].sort((a, b) => a.period.localeCompare(b.period)),
          updatedAt: new Date(),
        };
      }
      return dataset;
    });
    
    try {
      StorageManager.saveDatasets(updatedDatasets);
      set({ 
        datasets: updatedDatasets,
        currentDataset: get().currentDataset?.id === datasetId 
          ? updatedDatasets.find(d => d.id === datasetId) || null
          : get().currentDataset
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add periods'
      });
    }
  },

  clearError: () => set({ error: null }),
}));
