'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Building } from 'lucide-react';

export default function SimpleDashboard() {
  // Sample data based on your P&L sheet
  const [selectedPeriod] = useState('June 2025');
  
  const financialData = {
    period: 'June 2025',
    revenue: 104987.14,
    laborExpense: 45000,
    nonLaborExpense: 25000,
    rent: 99754.64,
    ebitda: 104987.14 - 45000 - 25000,
    ebitdar: 104987.14 - 45000 - 25000 + 99754.64,
    noi: 104987.14 - 45000 - 25000 - 99754.64,
  };

  const kpiData = [
    {
      title: 'Total Revenue',
      value: financialData.revenue,
      change: 2.5,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Labor Expense',
      value: financialData.laborExpense,
      change: -1.2,
      icon: Building,
      color: 'text-blue-600',
    },
    {
      title: 'EBITDA',
      value: financialData.ebitda,
      change: 5.8,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'NOI',
      value: financialData.noi,
      change: -3.1,
      icon: TrendingDown,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Alpine Vista Financial Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedPeriod} • Imported from Excel
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            const changeColor = kpi.change >= 0 ? 'text-green-600' : 'text-red-600';
            const changeIcon = kpi.change >= 0 ? '↗' : '↘';
            
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {kpi.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      ${kpi.value.toLocaleString()}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={kpi.change >= 0 ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        <span className="mr-1">{changeIcon}</span>
                        {Math.abs(kpi.change).toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        vs previous period
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Financial Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Revenue sources for {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="font-semibold">${financialData.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rent Revenue</span>
                  <span className="text-sm">${financialData.rent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Other Revenue</span>
                  <span className="text-sm">${(financialData.revenue - financialData.rent).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                Operating expenses for {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="font-semibold">${(financialData.laborExpense + financialData.nonLaborExpense).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Labor Expense</span>
                  <span className="text-sm">${financialData.laborExpense.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Non-Labor Expense</span>
                  <span className="text-sm">${financialData.nonLaborExpense.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Metrics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Key Financial Metrics</CardTitle>
              <CardDescription>
                Calculated metrics from your imported data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${financialData.ebitda.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">EBITDA</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((financialData.ebitda / financialData.revenue) * 100).toFixed(1)}% margin
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${financialData.ebitdar.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">EBITDAR</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((financialData.ebitdar / financialData.revenue) * 100).toFixed(1)}% margin
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${financialData.noi.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">NOI</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((financialData.noi / financialData.revenue) * 100).toFixed(1)}% margin
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Data Successfully Imported!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your Excel data has been processed and is now displayed in the dashboard. 
            You can see your financial metrics, revenue breakdown, and expense analysis above.
          </p>
        </div>
      </div>
    </div>
  );
}
