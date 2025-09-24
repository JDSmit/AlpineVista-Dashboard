import { Dataset, LayoutConfig } from './schema';

const STORAGE_VERSION = '1.0.0';
const DATASETS_KEY = 'altavista_datasets';
const LAYOUTS_KEY = 'altavista_layouts';

/**
 * Storage utilities with versioning and error handling
 */
export class StorageManager {
  private static getStorageKey(baseKey: string, datasetId?: string): string {
    return datasetId ? `${baseKey}_${datasetId}` : baseKey;
  }

  private static getVersionedKey(key: string): string {
    return `${key}_v${STORAGE_VERSION}`;
  }

  /**
   * Save datasets to localStorage
   */
  static saveDatasets(datasets: Dataset[]): void {
    try {
      const key = this.getVersionedKey(DATASETS_KEY);
      localStorage.setItem(key, JSON.stringify(datasets));
    } catch (error) {
      console.error('Failed to save datasets:', error);
      throw new Error('Storage quota exceeded. Please clear some data and try again.');
    }
  }

  /**
   * Load datasets from localStorage
   */
  static loadDatasets(): Dataset[] {
    try {
      const key = this.getVersionedKey(DATASETS_KEY);
      const data = localStorage.getItem(key);
      if (!data) return [];
      
      const datasets = JSON.parse(data);
      // Convert date strings back to Date objects
      return datasets.map((dataset: any) => ({
        ...dataset,
        createdAt: new Date(dataset.createdAt),
        updatedAt: new Date(dataset.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load datasets:', error);
      return [];
    }
  }

  /**
   * Save layout configuration for a dataset
   */
  static saveLayout(datasetId: string, layout: LayoutConfig): void {
    try {
      const key = this.getVersionedKey(this.getStorageKey(LAYOUTS_KEY, datasetId));
      localStorage.setItem(key, JSON.stringify(layout));
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }

  /**
   * Load layout configuration for a dataset
   */
  static loadLayout(datasetId: string): LayoutConfig | null {
    try {
      const key = this.getVersionedKey(this.getStorageKey(LAYOUTS_KEY, datasetId));
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load layout:', error);
      return null;
    }
  }

  /**
   * Clear all data (for debugging)
   */
  static clearAll(): void {
    try {
      // Clear all versioned keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('altavista_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('altavista_')) {
          used += localStorage.getItem(key)?.length || 0;
        }
      });
      
      // Estimate available space (5MB is typical limit)
      const available = 5 * 1024 * 1024 - used;
      const percentage = (used / (5 * 1024 * 1024)) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

/**
 * Hook for managing dataset storage
 */
export function useDatasetStorage() {
  const saveDataset = (dataset: Dataset) => {
    const datasets = StorageManager.loadDatasets();
    const existingIndex = datasets.findIndex(d => d.id === dataset.id);
    
    if (existingIndex >= 0) {
      datasets[existingIndex] = { ...dataset, updatedAt: new Date() };
    } else {
      datasets.push(dataset);
    }
    
    StorageManager.saveDatasets(datasets);
  };

  const deleteDataset = (datasetId: string) => {
    const datasets = StorageManager.loadDatasets();
    const filtered = datasets.filter(d => d.id !== datasetId);
    StorageManager.saveDatasets(filtered);
  };

  const getDataset = (datasetId: string): Dataset | null => {
    const datasets = StorageManager.loadDatasets();
    return datasets.find(d => d.id === datasetId) || null;
  };

  return {
    saveDataset,
    deleteDataset,
    getDataset,
    getAllDatasets: StorageManager.loadDatasets,
  };
}
