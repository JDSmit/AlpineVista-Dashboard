import { create } from 'zustand';
import { LayoutConfig, WidgetConfig } from '@/lib/schema';
import { StorageManager } from '@/lib/storage';

interface LayoutState {
  layouts: Record<string, LayoutConfig>;
  currentLayout: LayoutConfig | null;
  isLoading: boolean;
  error: string | null;
}

interface LayoutActions {
  loadLayout: (datasetId: string) => void;
  saveLayout: (datasetId: string, layout: LayoutConfig) => void;
  updateWidget: (datasetId: string, widgetId: string, updates: Partial<WidgetConfig>) => void;
  addWidget: (datasetId: string, widget: WidgetConfig) => void;
  removeWidget: (datasetId: string, widgetId: string) => void;
  resetLayout: (datasetId: string) => void;
  clearError: () => void;
}

const defaultWidgets: WidgetConfig[] = [
  {
    id: 'kpi-cards',
    type: 'kpi-cards',
    title: 'Key Performance Indicators',
    description: 'Revenue, EBITDA, NOI and other key metrics',
    visible: true,
    layout: { x: 0, y: 0, w: 12, h: 4 },
  },
  {
    id: 'revenue-line',
    type: 'revenue-line',
    title: 'Monthly Revenue Trend',
    description: 'Revenue over time with comparison',
    visible: true,
    layout: { x: 0, y: 4, w: 8, h: 6 },
  },
  {
    id: 'ebitda-waterfall',
    type: 'ebitda-waterfall',
    title: 'EBITDA Waterfall',
    description: 'Revenue breakdown to EBITDA',
    visible: true,
    layout: { x: 8, y: 4, w: 4, h: 6 },
  },
  {
    id: 'opex-breakdown',
    type: 'opex-breakdown',
    title: 'Operating Expenses',
    description: 'Labor vs non-labor expense breakdown',
    visible: true,
    layout: { x: 0, y: 10, w: 6, h: 6 },
  },
  {
    id: 'noi-trend',
    type: 'noi-trend',
    title: 'NOI Trend',
    description: 'Net Operating Income over time',
    visible: true,
    layout: { x: 6, y: 10, w: 6, h: 6 },
  },
  {
    id: 'detail-table',
    type: 'detail-table',
    title: 'Detailed Financials',
    description: 'Complete financial data table',
    visible: true,
    layout: { x: 0, y: 16, w: 12, h: 8 },
  },
];

export const useLayoutStore = create<LayoutState & LayoutActions>((set, get) => ({
  layouts: {},
  currentLayout: null,
  isLoading: false,
  error: null,

  loadLayout: (datasetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const layout = StorageManager.loadLayout(datasetId);
      
      if (layout) {
        set({ 
          currentLayout: layout,
          layouts: { ...get().layouts, [datasetId]: layout },
          isLoading: false 
        });
      } else {
        // Create default layout
        const defaultLayout: LayoutConfig = {
          datasetId,
          widgets: defaultWidgets,
          filters: {
            selectedPeriods: [],
            compareWith: null,
            showComparison: false,
          },
        };
        
        set({ 
          currentLayout: defaultLayout,
          layouts: { ...get().layouts, [datasetId]: defaultLayout },
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load layout',
        isLoading: false 
      });
    }
  },

  saveLayout: (datasetId: string, layout: LayoutConfig) => {
    try {
      StorageManager.saveLayout(datasetId, layout);
      set({ 
        currentLayout: layout,
        layouts: { ...get().layouts, [datasetId]: layout }
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save layout'
      });
    }
  },

  updateWidget: (datasetId: string, widgetId: string, updates: Partial<WidgetConfig>) => {
    const { layouts } = get();
    const layout = layouts[datasetId];
    
    if (!layout) return;
    
    const updatedWidgets = layout.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    
    const updatedLayout: LayoutConfig = {
      ...layout,
      widgets: updatedWidgets,
    };
    
    get().saveLayout(datasetId, updatedLayout);
  },

  addWidget: (datasetId: string, widget: WidgetConfig) => {
    const { layouts } = get();
    const layout = layouts[datasetId];
    
    if (!layout) return;
    
    const updatedWidgets = [...layout.widgets, widget];
    const updatedLayout: LayoutConfig = {
      ...layout,
      widgets: updatedWidgets,
    };
    
    get().saveLayout(datasetId, updatedLayout);
  },

  removeWidget: (datasetId: string, widgetId: string) => {
    const { layouts } = get();
    const layout = layouts[datasetId];
    
    if (!layout) return;
    
    const updatedWidgets = layout.widgets.filter(widget => widget.id !== widgetId);
    const updatedLayout: LayoutConfig = {
      ...layout,
      widgets: updatedWidgets,
    };
    
    get().saveLayout(datasetId, updatedLayout);
  },

  resetLayout: (datasetId: string) => {
    const defaultLayout: LayoutConfig = {
      datasetId,
      widgets: defaultWidgets,
      filters: {
        selectedPeriods: [],
        compareWith: null,
        showComparison: false,
      },
    };
    
    get().saveLayout(datasetId, defaultLayout);
  },

  clearError: () => set({ error: null }),
}));
