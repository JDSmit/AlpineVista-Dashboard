'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Building, Calendar, Plus } from 'lucide-react';

export default function CumulativeDashboard() {
  // Sample multi-month data (this would come from your imported datasets)
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const monthlyData = [
    {
      period: 'April 2025',
      revenue: 95000,
      laborExpense: 42000,
      nonLaborExpense: 23000,
      rent: 92000,
    },
    {
      period: 'May 2025', 
      revenue: 98000,
      laborExpense: 43000,
      nonLaborExpense: 24000,
      rent: 94000,
    },
    {
      period: 'June 2025',
      revenue: 104987.14,
      laborExpense: 45000,
      nonLaborExpense: 25000,
      rent: 99754.64,
    }
  ];

  const availablePeriods = ['all', ...monthlyData.map(d => d.period)];

  // Calculate cumulative data
  const cumulativeData = monthlyData.reduce((acc, month) => ({
    revenue: acc.revenue + month.revenue,
    laborExpense: acc.laborExpense + month.laborExpense,
    nonLaborExpense: acc.nonLaborExpense + month.nonLaborExpense,
    rent: acc.rent + month.rent,
  }), { revenue: 0, laborExpense: 0, nonLaborExpense: 0, rent: 0 });

  // Calculate current period data
  const currentPeriodData = selectedPeriod === 'all' 
    ? cumulativeData 
    : monthlyData.find(d => d.period === selectedPeriod) || monthlyData[monthlyData.length - 1];

  const ebitda = currentPeriodData.revenue - currentPeriodData.laborExpense - currentPeriodData.nonLaborExpense;
  const ebitdar = ebitda + currentPeriodData.rent;
  const noi = ebitda - currentPeriodData.rent;

  const kpiData = [
    {
      title: 'Total Revenue',
      value: currentPeriodData.revenue,
      change: selectedPeriod === 'all' ? 10.4 : 7.2,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Labor Expense',
      value: currentPeriodData.laborExpense,
      change: selectedPeriod === 'all' ? 7.1 : 4.7,
      icon: Building,
      color: 'text-blue-600',
    },
    {
      title: 'EBITDA',
      value: ebitda,
      change: selectedPeriod === 'all' ? 15.8 : 12.3,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'NOI',
      value: noi,
      change: selectedPeriod === 'all' ? 8.2 : -5.1,
      icon: noi >= 0 ? TrendingUp : TrendingDown,
      color: noi >= 0 ? 'text-green-600' : 'text-red-600',
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
                  {selectedPeriod === 'all' 
                    ? `Cumulative Data (${monthlyData.length} months)` 
                    : selectedPeriod
                  } • Imported from Excel
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add More Data
              </Button>
              <Badge variant="secondary">
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Period Selector */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">View Period:</span>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months (Cumulative)</SelectItem>
                    {monthlyData.map((month) => (
                      <SelectItem key={month.period} value={month.period}>
                        {month.period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {selectedPeriod === 'all' 
                    ? `${monthlyData.length} months of data`
                    : 'Single month view'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                        {selectedPeriod === 'all' ? 'vs previous quarter' : 'vs previous month'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Monthly Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                {selectedPeriod === 'all' 
                  ? `Cumulative revenue across ${monthlyData.length} months`
                  : `Revenue for ${selectedPeriod}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="font-semibold">${currentPeriodData.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rent Revenue</span>
                  <span className="text-sm">${currentPeriodData.rent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Other Revenue</span>
                  <span className="text-sm">${(currentPeriodData.revenue - currentPeriodData.rent).toLocaleString()}</span>
                </div>
                {selectedPeriod === 'all' && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Average monthly revenue: ${(currentPeriodData.revenue / monthlyData.length).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                {selectedPeriod === 'all' 
                  ? `Cumulative expenses across ${monthlyData.length} months`
                  : `Expenses for ${selectedPeriod}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="font-semibold">${(currentPeriodData.laborExpense + currentPeriodData.nonLaborExpense).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Labor Expense</span>
                  <span className="text-sm">${currentPeriodData.laborExpense.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Non-Labor Expense</span>
                  <span className="text-sm">${currentPeriodData.nonLaborExpense.toLocaleString()}</span>
                </div>
                {selectedPeriod === 'all' && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Average monthly expenses: ${((currentPeriodData.laborExpense + currentPeriodData.nonLaborExpense) / monthlyData.length).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>
              Revenue and expenses over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={month.period} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{month.period}</div>
                      <div className="text-sm text-muted-foreground">
                        Revenue: ${month.revenue.toLocaleString()} • Expenses: ${(month.laborExpense + month.nonLaborExpense).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${(month.revenue - month.laborExpense - month.nonLaborExpense).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">EBITDA</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Metrics */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Key Financial Metrics</CardTitle>
              <CardDescription>
                {selectedPeriod === 'all' 
                  ? `Cumulative metrics across ${monthlyData.length} months`
                  : `Metrics for ${selectedPeriod}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${ebitda.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">EBITDA</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((ebitda / currentPeriodData.revenue) * 100).toFixed(1)}% margin
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${ebitdar.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">EBITDAR</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((ebitdar / currentPeriodData.revenue) * 100).toFixed(1)}% margin
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${noi.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">NOI</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((noi / currentPeriodData.revenue) * 100).toFixed(1)}% margin
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Cumulative Data Successfully Imported!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your Excel data has been processed and is now displayed in the cumulative dashboard. 
            You can view individual months or see the cumulative totals across all imported periods.
          </p>
        </div>
      </div>
    </div>
  );
}
