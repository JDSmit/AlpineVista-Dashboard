import { describe, it, expect } from 'vitest';
import { calculateMetrics, safeDivide, calculatePeriodChange, aggregateMetrics } from './metrics';
import { FacilityPeriod } from './schema';

describe('Metrics Calculations', () => {
  const samplePeriod: FacilityPeriod = {
    id: 'test-1',
    facilityName: 'Test Facility',
    period: '2024-01',
    currency: 'USD',
    values: {
      revenueTotal: 1000000,
      laborExpense: 400000,
      nonLaborExpense: 200000,
      rent: 150000,
      otherIncome: 10000,
      depreciation: 80000,
      interest: 30000,
    },
  };

  describe('calculateMetrics', () => {
    it('should calculate EBITDA correctly', () => {
      const metrics = calculateMetrics(samplePeriod);
      expect(metrics.ebitda).toBe(400000); // 1M - 400K - 200K = 400K
    });

    it('should calculate EBITDAR correctly', () => {
      const metrics = calculateMetrics(samplePeriod);
      expect(metrics.ebitdar).toBe(550000); // EBITDA + Rent = 400K + 150K
    });

    it('should calculate NOI correctly', () => {
      const metrics = calculateMetrics(samplePeriod);
      expect(metrics.noi).toBe(250000); // EBITDA - Rent = 400K - 150K
    });

    it('should calculate operating expenses correctly', () => {
      const metrics = calculateMetrics(samplePeriod);
      expect(metrics.opex).toBe(600000); // Labor + Non-Labor = 400K + 200K
    });

    it('should calculate margins correctly', () => {
      const metrics = calculateMetrics(samplePeriod);
      expect(metrics.ebitdaMargin).toBe(40); // 400K / 1M * 100 = 40%
      expect(metrics.ebitdarMargin).toBe(55); // 550K / 1M * 100 = 55%
      expect(metrics.noiMargin).toBe(25); // 250K / 1M * 100 = 25%
    });
  });

  describe('safeDivide', () => {
    it('should handle normal division', () => {
      expect(safeDivide(100, 10)).toBe(10);
    });

    it('should handle zero denominator', () => {
      expect(safeDivide(100, 0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(safeDivide(-100, 10)).toBe(-10);
    });

    it('should handle very small numbers', () => {
      expect(safeDivide(0.001, 0.0001)).toBe(10);
    });
  });

  describe('calculatePeriodChange', () => {
    it('should calculate positive change correctly', () => {
      const change = calculatePeriodChange(120, 100);
      expect(change.absolute).toBe(20);
      expect(change.percentage).toBe(20);
    });

    it('should calculate negative change correctly', () => {
      const change = calculatePeriodChange(80, 100);
      expect(change.absolute).toBe(-20);
      expect(change.percentage).toBe(-20);
    });

    it('should handle zero previous value', () => {
      const change = calculatePeriodChange(100, 0);
      expect(change.absolute).toBe(100);
      expect(change.percentage).toBe(0); // safeDivide returns 0 for division by zero
    });
  });

  describe('aggregateMetrics', () => {
    it('should aggregate multiple periods correctly', () => {
      const periods: FacilityPeriod[] = [
        {
          ...samplePeriod,
          period: '2024-01',
          values: { ...samplePeriod.values, revenueTotal: 1000000 }
        },
        {
          ...samplePeriod,
          period: '2024-02',
          values: { ...samplePeriod.values, revenueTotal: 1200000 }
        },
      ];

      const aggregated = aggregateMetrics(periods);
      
      expect(aggregated.revenueTotal).toBe(2200000); // 1M + 1.2M
      expect(aggregated.ebitda).toBe(880000); // 400K + 480K
      expect(aggregated.ebitdar).toBe(1210000); // 550K + 660K
      expect(aggregated.noi).toBe(550000); // 250K + 300K
    });

    it('should calculate aggregated margins correctly', () => {
      const periods: FacilityPeriod[] = [
        {
          ...samplePeriod,
          period: '2024-01',
          values: { ...samplePeriod.values, revenueTotal: 1000000 }
        },
        {
          ...samplePeriod,
          period: '2024-02',
          values: { ...samplePeriod.values, revenueTotal: 1000000 }
        },
      ];

      const aggregated = aggregateMetrics(periods);
      
      // Should be the same as individual period since both have same values
      expect(aggregated.ebitdaMargin).toBe(40);
      expect(aggregated.ebitdarMargin).toBe(55);
      expect(aggregated.noiMargin).toBe(25);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero revenue', () => {
      const zeroRevenuePeriod: FacilityPeriod = {
        ...samplePeriod,
        values: { ...samplePeriod.values, revenueTotal: 0 }
      };

      const metrics = calculateMetrics(zeroRevenuePeriod);
      expect(metrics.ebitda).toBe(-600000); // 0 - 400K - 200K
      expect(metrics.ebitdaMargin).toBe(0); // safeDivide returns 0
    });

    it('should handle negative expenses', () => {
      const negativeExpensePeriod: FacilityPeriod = {
        ...samplePeriod,
        values: { 
          ...samplePeriod.values, 
          laborExpense: -100000, // Negative expense (credit)
          nonLaborExpense: -50000 
        }
      };

      const metrics = calculateMetrics(negativeExpensePeriod);
      expect(metrics.opex).toBe(-150000); // -100K + (-50K)
      expect(metrics.ebitda).toBe(1150000); // 1M - (-150K)
    });
  });
});
