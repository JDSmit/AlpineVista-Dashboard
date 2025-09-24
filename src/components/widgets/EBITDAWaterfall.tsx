'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacilityPeriod } from '@/lib/schema';
import { calculateMetrics } from '@/lib/metrics';
import { formatCurrency, formatPercentage } from '@/lib/format';

interface EBITDAWaterfallProps {
  data: FacilityPeriod[];
  selectedPeriods: string[];
  compareWith?: string | null;
}

export function EBITDAWaterfall({ data, selectedPeriods, compareWith }: EBITDAWaterfallProps) {
  // Filter data by selected periods
  const filteredData = data.filter(period => selectedPeriods.includes(period.period));
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>EBITDA Waterfall</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected periods.</p>
        </CardContent>
      </Card>
    );
  }

  // Use the most recent period for the waterfall
  const currentPeriod = filteredData[filteredData.length - 1];
  const metrics = calculateMetrics(currentPeriod);
  
  // Prepare waterfall data
  const waterfallData = [
    {
      name: 'Revenue',
      value: currentPeriod.values.revenueTotal,
      cumulative: currentPeriod.values.revenueTotal,
      color: '#10b981',
    },
    {
      name: 'Labor Expense',
      value: -currentPeriod.values.laborExpense,
      cumulative: currentPeriod.values.revenueTotal - currentPeriod.values.laborExpense,
      color: '#ef4444',
    },
    {
      name: 'Non-Labor Expense',
      value: -currentPeriod.values.nonLaborExpense,
      cumulative: currentPeriod.values.revenueTotal - currentPeriod.values.laborExpense - currentPeriod.values.nonLaborExpense,
      color: '#f97316',
    },
    {
      name: 'EBITDA',
      value: metrics.ebitda,
      cumulative: metrics.ebitda,
      color: '#3b82f6',
    },
    {
      name: 'Rent',
      value: -currentPeriod.values.rent,
      cumulative: metrics.ebitda - currentPeriod.values.rent,
      color: '#8b5cf6',
    },
    {
      name: 'NOI',
      value: metrics.noi,
      cumulative: metrics.noi,
      color: '#06b6d4',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const revenue = currentPeriod.values.revenueTotal;
      const percentage = ((data.value / revenue) * 100).toFixed(1);
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm">
            Cumulative: {formatCurrency(data.cumulative)}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage}% of revenue
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>EBITDA Waterfall</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatPeriod(currentPeriod.period)} - Revenue breakdown to NOI
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={(entry: any) => entry.color}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenue: {formatCurrency(currentPeriod.values.revenueTotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Labor: {formatCurrency(currentPeriod.values.laborExpense)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Non-Labor: {formatCurrency(currentPeriod.values.nonLaborExpense)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>EBITDA: {formatCurrency(metrics.ebitda)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Rent: {formatCurrency(currentPeriod.values.rent)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded"></div>
              <span>NOI: {formatCurrency(metrics.noi)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
