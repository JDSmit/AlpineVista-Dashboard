'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacilityPeriod } from '@/lib/schema';
import { formatCurrency, formatPeriod } from '@/lib/format';

interface OpexBreakdownProps {
  data: FacilityPeriod[];
  selectedPeriods: string[];
  compareWith?: string | null;
}

export function OpexBreakdown({ data, selectedPeriods, compareWith }: OpexBreakdownProps) {
  // Filter data by selected periods
  const filteredData = data.filter(period => selectedPeriods.includes(period.period));
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operating Expenses Breakdown</CardTitle>
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
    labor: period.values.laborExpense,
    nonLabor: period.values.nonLaborExpense,
    total: period.values.laborExpense + period.values.nonLaborExpense,
  }));

  // Add comparison data if available
  let comparisonData: any[] = [];
  if (compareWith) {
    const comparisonPeriods = data.filter(period => period.period === compareWith);
    comparisonData = comparisonPeriods.map(period => ({
      period: period.period,
      periodFormatted: formatPeriod(period.period),
      comparisonLabor: period.values.laborExpense,
      comparisonNonLabor: period.values.nonLaborExpense,
      comparisonTotal: period.values.laborExpense + period.values.nonLaborExpense,
    }));
  }

  // Merge data for comparison
  const mergedData = chartData.map(item => {
    const comparison = comparisonData.find(comp => comp.period === item.period);
    return {
      ...item,
      comparisonLabor: comparison?.comparisonLabor || null,
      comparisonNonLabor: comparison?.comparisonNonLabor || null,
      comparisonTotal: comparison?.comparisonTotal || null,
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
        <CardTitle>Operating Expenses Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Labor vs Non-Labor expenses over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mergedData}>
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
              <Bar
                dataKey="labor"
                stackId="current"
                fill="#ef4444"
                name="Labor Expense"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="nonLabor"
                stackId="current"
                fill="#f97316"
                name="Non-Labor Expense"
                radius={[4, 4, 0, 0]}
              />
              {compareWith && (
                <>
                  <Bar
                    dataKey="comparisonLabor"
                    stackId="comparison"
                    fill="#ef4444"
                    name="Comparison Labor"
                    fillOpacity={0.3}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="comparisonNonLabor"
                    stackId="comparison"
                    fill="#f97316"
                    name="Comparison Non-Labor"
                    fillOpacity={0.3}
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Labor Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Non-Labor Expense</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Total Opex: {formatCurrency(
                filteredData.reduce((sum, period) => 
                  sum + period.values.laborExpense + period.values.nonLaborExpense, 0
                )
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
