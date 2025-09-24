'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacilityPeriod } from '@/lib/schema';
import { formatCurrency, formatPeriod } from '@/lib/format';

interface RevenueLineChartProps {
  data: FacilityPeriod[];
  selectedPeriods: string[];
  compareWith?: string | null;
}

export function RevenueLineChart({ data, selectedPeriods, compareWith }: RevenueLineChartProps) {
  // Filter data by selected periods
  const filteredData = data.filter(period => selectedPeriods.includes(period.period));
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected periods.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = filteredData.map(period => ({
    period: period.period,
    periodFormatted: formatPeriod(period.period),
    revenue: period.values.revenueTotal,
  }));

  // Add comparison data if available
  let comparisonData: any[] = [];
  if (compareWith) {
    const comparisonPeriods = data.filter(period => period.period === compareWith);
    comparisonData = comparisonPeriods.map(period => ({
      period: period.period,
      periodFormatted: formatPeriod(period.period),
      comparisonRevenue: period.values.revenueTotal,
    }));
  }

  // Merge data for comparison
  const mergedData = chartData.map(item => {
    const comparison = comparisonData.find(comp => comp.period === item.period);
    return {
      ...item,
      comparisonRevenue: comparison?.comparisonRevenue || null,
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
        <CardTitle>Monthly Revenue Trend</CardTitle>
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
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="Current Period"
              />
              {compareWith && (
                <Line
                  type="monotone"
                  dataKey="comparisonRevenue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  name="Comparison Period"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
