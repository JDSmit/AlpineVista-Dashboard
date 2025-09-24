import { FacilityPeriod, DerivedMetrics } from './schema';

/**
 * Calculate derived financial metrics from facility period data
 */
export function calculateMetrics(period: FacilityPeriod): DerivedMetrics {
  const { values } = period;
  
  // Operating expenses = labor + non-labor
  const opex = values.laborExpense + values.nonLaborExpense;
  
  // EBITDA = Revenue - Operating Expenses
  const ebitda = values.revenueTotal - opex;
  
  // EBITDAR = EBITDA + Rent
  const ebitdar = ebitda + values.rent;
  
  // NOI = EBITDA - Rent (or EBITDAR - 2*Rent)
  const noi = ebitda - values.rent;
  
  // Margins as percentages of revenue
  const ebitdaMargin = safeDivide(ebitda, values.revenueTotal) * 100;
  const ebitdarMargin = safeDivide(ebitdar, values.revenueTotal) * 100;
  const noiMargin = safeDivide(noi, values.revenueTotal) * 100;
  
  return {
    opex,
    ebitda,
    ebitdar,
    noi,
    ebitdaMargin,
    ebitdarMargin,
    noiMargin,
  };
}

/**
 * Safe division that handles zero and null values
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || !isFinite(denominator)) {
    return 0;
  }
  return numerator / denominator;
}

/**
 * Calculate period-over-period change
 */
export function calculatePeriodChange(current: number, previous: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = current - previous;
  const percentage = safeDivide(absolute, previous) * 100;
  
  return { absolute, percentage };
}

/**
 * Calculate trend direction
 */
export function getTrendDirection(percentage: number): 'up' | 'down' | 'flat' {
  if (percentage > 1) return 'up';
  if (percentage < -1) return 'down';
  return 'flat';
}

/**
 * Aggregate metrics across multiple periods
 */
export function aggregateMetrics(periods: FacilityPeriod[]): DerivedMetrics {
  const totals = periods.reduce(
    (acc, period) => {
      const metrics = calculateMetrics(period);
      return {
        revenueTotal: acc.revenueTotal + period.values.revenueTotal,
        opex: acc.opex + metrics.opex,
        ebitda: acc.ebitda + metrics.ebitda,
        ebitdar: acc.ebitdar + metrics.ebitdar,
        noi: acc.noi + metrics.noi,
      };
    },
    {
      revenueTotal: 0,
      opex: 0,
      ebitda: 0,
      ebitdar: 0,
      noi: 0,
    }
  );
  
  return {
    opex: totals.opex,
    ebitda: totals.ebitda,
    ebitdar: totals.ebitdar,
    noi: totals.noi,
    ebitdaMargin: safeDivide(totals.ebitda, totals.revenueTotal) * 100,
    ebitdarMargin: safeDivide(totals.ebitdar, totals.revenueTotal) * 100,
    noiMargin: safeDivide(totals.noi, totals.revenueTotal) * 100,
  };
}

/**
 * Calculate year-over-year growth
 */
export function calculateYoYGrowth(currentPeriods: FacilityPeriod[], previousPeriods: FacilityPeriod[]): {
  revenue: number;
  ebitda: number;
  ebitdar: number;
  noi: number;
} {
  const current = aggregateMetrics(currentPeriods);
  const previous = aggregateMetrics(previousPeriods);
  
  return {
    revenue: calculatePeriodChange(current.revenueTotal, previous.revenueTotal).percentage,
    ebitda: calculatePeriodChange(current.ebitda, previous.ebitda).percentage,
    ebitdar: calculatePeriodChange(current.ebitdar, previous.ebitdar).percentage,
    noi: calculatePeriodChange(current.noi, previous.noi).percentage,
  };
}
