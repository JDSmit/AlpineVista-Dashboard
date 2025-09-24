'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacilityPeriod } from '@/lib/schema';
import { calculateMetrics } from '@/lib/metrics';
import { formatCurrency, formatPeriod } from '@/lib/format';

interface NOITrendProps {
  data: FacilityPeriod[];
  selectedPeriods: string[];
  compareWith?: string | null;
}

export function NOITrend({ data, selectedPeriods, compareWith }: NOITrendProps) {
  // Filter data by selected periods
  const filteredData = data.filter(period => selectedPeriods.includes(period.period));
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>NOI Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected periods.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = filteredData.map(period => {
    const metrics = calculateMetrics(period);
    return {
      period: period.period,
      periodFormatted: formatPeriod(period.period),
      noi: metrics.noi,
      ebitda: metrics.ebitda,
      ebitdar: metrics.ebitdar,
    };
  });

  // Add comparison data if available
  let comparisonData: any[] = [];
  if (compareWith) {
    const comparisonPeriods = data.filter(period => period.period === compareWith);
    comparisonData = comparisonPeriods.map(period => {
      const metrics = calculateMetrics(period);
      return {
        period: period.period,
        periodFormatted: formatPeriod(period.period),
        comparisonNOI: metrics.noi,
        comparisonEBITDA: metrics.ebitda,
        comparisonEBITDAR: metrics.ebitdar,
      };
    });
  }

  // Merge data for comparison
  const mergedData = chartData.map(item => {
    const comparison = comparisonData.find(comp => comp.period === item.period);
    return {
      ...item,
      comparisonNOI: comparison?.comparisonNOI || null,
      comparisonEBITDA: comparison?.comparisonEBITDA || null,
      comparisonEBITDAR: comparison?.comparisonEBITDAR || null,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{formatPeriod(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>NOI Trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Net Operating Income over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="periodFormatted" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="noi"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                name="NOI"
              />
              <Line
                type="monotone"
                dataKey="ebitda"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="EBITDA"
              />
              <Line
                type="monotone"
                dataKey="ebitdar"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                name="EBITDAR"
              />
              {compareWith && (
                <>
                  <Line
                    type="monotone"
                    dataKey="comparisonNOI"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                    name="Comparison NOI"
                  />
                  <Line
                    type="monotone"
                    dataKey="comparisonEBITDA"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    name="Comparison EBITDA"
                  />
                  <Line
                    type="monotone"
                    dataKey="comparisonEBITDAR"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    name="Comparison EBITDAR"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
