'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FacilityPeriod } from '@/lib/schema';
import { calculateMetrics, calculatePeriodChange, getTrendDirection } from '@/lib/metrics';
import { formatCurrency, formatPercentage, formatChange } from '@/lib/format';

interface KPICardsProps {
  data: FacilityPeriod[];
  selectedPeriods: string[];
  compareWith?: string | null;
}

export function KPICards({ data, selectedPeriods, compareWith }: KPICardsProps) {
  // Filter data by selected periods
  const filteredData = data.filter(period => selectedPeriods.includes(period.period));
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected periods.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate current period metrics
  const currentPeriod = filteredData[filteredData.length - 1];
  const currentMetrics = calculateMetrics(currentPeriod);
  
  // Calculate comparison metrics
  let comparisonMetrics = null;
  if (compareWith) {
    const comparisonPeriod = data.find(p => p.period === compareWith);
    if (comparisonPeriod) {
      comparisonMetrics = calculateMetrics(comparisonPeriod);
    }
  } else if (filteredData.length > 1) {
    // Compare with previous period
    const previousPeriod = filteredData[filteredData.length - 2];
    comparisonMetrics = calculateMetrics(previousPeriod);
  }

  const kpiData = [
    {
      title: 'Revenue',
      value: currentMetrics.revenueTotal || currentPeriod.values.revenueTotal,
      change: comparisonMetrics ? 
        calculatePeriodChange(currentPeriod.values.revenueTotal, comparisonMetrics.revenueTotal || comparisonPeriod?.values.revenueTotal || 0) : 
        null,
      format: formatCurrency,
    },
    {
      title: 'Operating Expenses',
      value: currentMetrics.opex,
      change: comparisonMetrics ? 
        calculatePeriodChange(currentMetrics.opex, comparisonMetrics.opex) : 
        null,
      format: formatCurrency,
    },
    {
      title: 'EBITDA',
      value: currentMetrics.ebitda,
      change: comparisonMetrics ? 
        calculatePeriodChange(currentMetrics.ebitda, comparisonMetrics.ebitda) : 
        null,
      format: formatCurrency,
    },
    {
      title: 'EBITDAR',
      value: currentMetrics.ebitdar,
      change: comparisonMetrics ? 
        calculatePeriodChange(currentMetrics.ebitdar, comparisonMetrics.ebitdar) : 
        null,
      format: formatCurrency,
    },
    {
      title: 'NOI',
      value: currentMetrics.noi,
      change: comparisonMetrics ? 
        calculatePeriodChange(currentMetrics.noi, comparisonMetrics.noi) : 
        null,
      format: formatCurrency,
    },
    {
      title: 'EBITDA Margin',
      value: currentMetrics.ebitdaMargin,
      change: comparisonMetrics ? 
        calculatePeriodChange(currentMetrics.ebitdaMargin, comparisonMetrics.ebitdaMargin) : 
        null,
      format: formatPercentage,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => {
        const change = kpi.change;
        const changeDisplay = change ? formatChange(change.percentage) : null;
        
        return (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {kpi.format(kpi.value)}
                </div>
                
                {changeDisplay && (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={changeDisplay.color === 'text-green-600' ? 'default' : 
                              changeDisplay.color === 'text-red-600' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      <span className="mr-1">{changeDisplay.icon}</span>
                      {changeDisplay.text}
                    </Badge>
                    {change && (
                      <span className="text-xs text-muted-foreground">
                        vs {compareWith ? 'comparison' : 'previous period'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
