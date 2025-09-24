import { z } from 'zod';

// Core data model for facility financial periods
export const FacilityPeriodSchema = z.object({
  id: z.string(),
  facilityName: z.string().default('Alpine Vista'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
  currency: z.string().default('USD'),
  values: z.object({
    revenueTotal: z.number(),
    laborExpense: z.number(),
    nonLaborExpense: z.number(),
    rent: z.number(),
    otherIncome: z.number().optional(),
    depreciation: z.number().optional(),
    interest: z.number().optional(),
    census: z.number().optional(),
    adr: z.number().optional(),
  }),
});

export type FacilityPeriod = z.infer<typeof FacilityPeriodSchema>;

// Dataset metadata for storage
export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  facilityName: z.string(),
  periods: z.array(FacilityPeriodSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Dataset = z.infer<typeof DatasetSchema>;

// Excel mapping configuration
export const ColumnMappingSchema = z.object({
  period: z.string(),
  revenueTotal: z.string(),
  laborExpense: z.string(),
  nonLaborExpense: z.string(),
  rent: z.string(),
  otherIncome: z.string().optional(),
  depreciation: z.string().optional(),
  interest: z.string().optional(),
  census: z.string().optional(),
  adr: z.string().optional(),
});

export type ColumnMapping = z.infer<typeof ColumnMappingSchema>;

// Widget configuration
export const WidgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum([
    'kpi-cards',
    'revenue-line',
    'ebitda-waterfall',
    'opex-breakdown',
    'noi-trend',
    'census-adr',
    'detail-table'
  ]),
  title: z.string(),
  description: z.string().optional(),
  visible: z.boolean().default(true),
  layout: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }).optional(),
});

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

// Dashboard layout configuration
export const LayoutConfigSchema = z.object({
  datasetId: z.string(),
  widgets: z.array(WidgetConfigSchema),
  filters: z.object({
    selectedPeriods: z.array(z.string()),
    compareWith: z.string().optional(),
    showComparison: z.boolean().default(false),
  }),
});

export type LayoutConfig = z.infer<typeof LayoutConfigSchema>;

// Derived metrics for calculations
export interface DerivedMetrics {
  opex: number;
  ebitda: number;
  ebitdar: number;
  noi: number;
  ebitdaMargin: number;
  ebitdarMargin: number;
  noiMargin: number;
}

// Excel parsing result
export interface ExcelParseResult {
  sheets: string[];
  data: Record<string, any[][]>;
  headers: Record<string, string[]>;
}
