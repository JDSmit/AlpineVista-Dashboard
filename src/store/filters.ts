import { create } from 'zustand';
import { FacilityPeriod } from '@/lib/schema';

interface FiltersState {
  selectedPeriods: string[];
  compareWith: string | null;
  showComparison: boolean;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface FiltersActions {
  setSelectedPeriods: (periods: string[]) => void;
  setCompareWith: (period: string | null) => void;
  setShowComparison: (show: boolean) => void;
  setDateRange: (start: string | null, end: string | null) => void;
  resetFilters: () => void;
  getAvailablePeriods: (periods: FacilityPeriod[]) => string[];
  getFilteredPeriods: (periods: FacilityPeriod[]) => FacilityPeriod[];
  getComparisonPeriods: (periods: FacilityPeriod[]) => FacilityPeriod[];
}

const initialState: FiltersState = {
  selectedPeriods: [],
  compareWith: null,
  showComparison: false,
  dateRange: {
    start: null,
    end: null,
  },
};

export const useFiltersStore = create<FiltersState & FiltersActions>((set, get) => ({
  ...initialState,

  setSelectedPeriods: (periods: string[]) => {
    set({ selectedPeriods: periods });
  },

  setCompareWith: (period: string | null) => {
    set({ compareWith: period });
  },

  setShowComparison: (show: boolean) => {
    set({ showComparison: show });
  },

  setDateRange: (start: string | null, end: string | null) => {
    set({ 
      dateRange: { start, end },
      // Auto-update selected periods based on date range
      selectedPeriods: get().getAvailablePeriods([]).filter(period => {
        if (!start || !end) return true;
        return period >= start && period <= end;
      })
    });
  },

  resetFilters: () => {
    set(initialState);
  },

  getAvailablePeriods: (periods: FacilityPeriod[]): string[] => {
    const uniquePeriods = [...new Set(periods.map(p => p.period))];
    return uniquePeriods.sort();
  },

  getFilteredPeriods: (periods: FacilityPeriod[]): FacilityPeriod[] => {
    const { selectedPeriods, dateRange } = get();
    
    return periods.filter(period => {
      // Filter by selected periods
      if (selectedPeriods.length > 0 && !selectedPeriods.includes(period.period)) {
        return false;
      }
      
      // Filter by date range
      if (dateRange.start && period.period < dateRange.start) {
        return false;
      }
      if (dateRange.end && period.period > dateRange.end) {
        return false;
      }
      
      return true;
    });
  },

  getComparisonPeriods: (periods: FacilityPeriod[]): FacilityPeriod[] => {
    const { compareWith, showComparison } = get();
    
    if (!showComparison || !compareWith) {
      return [];
    }
    
    return periods.filter(period => period.period === compareWith);
  },
}));
