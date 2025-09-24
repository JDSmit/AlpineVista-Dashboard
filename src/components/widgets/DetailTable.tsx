'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter } from 'lucide-react';
import { FacilityPeriod } from '@/lib/schema';
import { calculateMetrics } from '@/lib/metrics';
import { formatCurrency, formatPercentage, formatPeriod } from '@/lib/format';

interface DetailTableProps {
  data: FacilityPeriod[];
  selectedPeriods: string[];
  compareWith?: string | null;
}

export function DetailTable({ data, selectedPeriods, compareWith }: DetailTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('period');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterField, setFilterField] = useState<string>('all');

  // Filter data by selected periods
  const filteredData = data.filter(period => selectedPeriods.includes(period.period));
  
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Financials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for selected periods.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare table data with calculated metrics
  const tableData = filteredData.map(period => {
    const metrics = calculateMetrics(period);
    return {
      ...period,
      metrics,
    };
  });

  // Sort data
  const sortedData = [...tableData].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a];
    let bValue: any = b[sortField as keyof typeof b];
    
    if (sortField === 'metrics') {
      aValue = a.metrics.ebitda;
      bValue = b.metrics.ebitda;
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter data based on search and field filters
  const finalData = sortedData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesField = filterField === 'all' || 
      (filterField === 'revenue' && item.values.revenueTotal > 0) ||
      (filterField === 'ebitda' && item.metrics.ebitda > 0) ||
      (filterField === 'noi' && item.metrics.noi > 0);
    
    return matchesSearch && matchesField;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csvData = finalData.map(item => ({
      Period: item.period,
      Facility: item.facilityName,
      Revenue: item.values.revenueTotal,
      'Labor Expense': item.values.laborExpense,
      'Non-Labor Expense': item.values.nonLaborExpense,
      Rent: item.values.rent,
      EBITDA: item.metrics.ebitda,
      EBITDAR: item.metrics.ebitdar,
      NOI: item.metrics.noi,
      'EBITDA Margin': item.metrics.ebitdaMargin,
      'EBITDAR Margin': item.metrics.ebitdarMargin,
      'NOI Margin': item.metrics.noiMargin,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Financials</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete financial data with calculated metrics
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search periods or facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="revenue">Revenue > 0</SelectItem>
                <SelectItem value="ebitda">EBITDA > 0</SelectItem>
                <SelectItem value="noi">NOI > 0</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left p-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('period')}
                  >
                    Period {sortField === 'period' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Labor</th>
                  <th className="text-left p-2">Non-Labor</th>
                  <th className="text-left p-2">Rent</th>
                  <th 
                    className="text-left p-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('metrics')}
                  >
                    EBITDA {sortField === 'metrics' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left p-2">EBITDAR</th>
                  <th className="text-left p-2">NOI</th>
                  <th className="text-left p-2">EBITDA%</th>
                </tr>
              </thead>
              <tbody>
                {finalData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{formatPeriod(item.period)}</td>
                    <td className="p-2">{formatCurrency(item.values.revenueTotal)}</td>
                    <td className="p-2">{formatCurrency(item.values.laborExpense)}</td>
                    <td className="p-2">{formatCurrency(item.values.nonLaborExpense)}</td>
                    <td className="p-2">{formatCurrency(item.values.rent)}</td>
                    <td className="p-2">
                      <span className={item.metrics.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.metrics.ebitda)}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={item.metrics.ebitdar >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.metrics.ebitdar)}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={item.metrics.noi >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.metrics.noi)}
                      </span>
                    </td>
                    <td className="p-2">
                      <Badge variant={item.metrics.ebitdaMargin >= 0 ? 'default' : 'destructive'}>
                        {formatPercentage(item.metrics.ebitdaMargin)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {finalData.length} of {tableData.length} records
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
