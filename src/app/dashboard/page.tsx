'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDatasetsStore } from '@/store/datasets';
import { useFiltersStore } from '@/store/filters';
import { useLayoutStore } from '@/store/layout';
import { KPICards } from '@/components/widgets/KPICards';
import { RevenueLineChart } from '@/components/widgets/RevenueLineChart';
import { EBITDAWaterfall } from '@/components/widgets/EBITDAWaterfall';
import { OpexBreakdown } from '@/components/widgets/OpexBreakdown';
import { NOITrend } from '@/components/widgets/NOITrend';
import { DetailTable } from '@/components/widgets/DetailTable';
import { WidgetConfig } from '@/lib/schema';
import { formatPeriodRange } from '@/lib/format';
import { 
  ArrowLeft, 
  Settings, 
  Download, 
  RotateCcw, 
  Eye, 
  EyeOff,
  BarChart3,
  TrendingUp,
  Table,
  PieChart
} from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const datasetId = searchParams.get('datasetId');
  
  const { currentDataset, loadDatasets } = useDatasetsStore();
  const { 
    selectedPeriods, 
    compareWith, 
    showComparison,
    setSelectedPeriods,
    setCompareWith,
    setShowComparison,
    getAvailablePeriods,
    getFilteredPeriods,
    getComparisonPeriods
  } = useFiltersStore();
  const { 
    currentLayout, 
    loadLayout, 
    updateWidget,
    resetLayout 
  } = useLayoutStore();

  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  useEffect(() => {
    if (datasetId) {
      loadLayout(datasetId);
    }
  }, [datasetId, loadLayout]);

  useEffect(() => {
    if (currentDataset && currentLayout) {
      const availablePeriods = getAvailablePeriods(currentDataset.periods);
      if (availablePeriods.length > 0 && selectedPeriods.length === 0) {
        setSelectedPeriods(availablePeriods);
      }
    }
  }, [currentDataset, currentLayout, selectedPeriods, setSelectedPeriods, getAvailablePeriods]);

  if (!datasetId || !currentDataset || !currentLayout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Loading Dashboard</h2>
              <p className="text-muted-foreground">Please wait while we load your data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availablePeriods = getAvailablePeriods(currentDataset.periods);
  const filteredData = getFilteredPeriods(currentDataset.periods);
  const comparisonData = getComparisonPeriods(currentDataset.periods);

  const handleLayoutChange = (layout: any) => {
    if (datasetId) {
      const updatedLayout = {
        ...currentLayout,
        widgets: currentLayout.widgets.map(widget => {
          const layoutItem = layout.find((item: any) => item.i === widget.id);
          if (layoutItem) {
            return {
              ...widget,
              layout: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              }
            };
          }
          return widget;
        })
      };
      // Save layout would be called here
    }
  };

  const handleWidgetToggle = (widgetId: string, visible: boolean) => {
    updateWidget(datasetId, widgetId, { visible });
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    // Export functionality would be implemented here
    console.log(`Exporting dashboard as ${format}`);
    setIsExportOpen(false);
  };

  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.visible) return null;

    const commonProps = {
      data: filteredData,
      selectedPeriods,
      compareWith: showComparison ? compareWith : null,
    };

    switch (widget.type) {
      case 'kpi-cards':
        return <KPICards {...commonProps} />;
      case 'revenue-line':
        return <RevenueLineChart {...commonProps} />;
      case 'ebitda-waterfall':
        return <EBITDAWaterfall {...commonProps} />;
      case 'opex-breakdown':
        return <OpexBreakdown {...commonProps} />;
      case 'noi-trend':
        return <NOITrend {...commonProps} />;
      case 'detail-table':
        return <DetailTable {...commonProps} />;
      default:
        return null;
    }
  };

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
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{currentDataset.facilityName}</h1>
                <p className="text-sm text-muted-foreground">
                  {formatPeriodRange(availablePeriods)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWidgetLibraryOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Widgets
              </Button>
              
              <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Dashboard</DialogTitle>
                    <DialogDescription>
                      Choose the format for your dashboard export
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExport('png')} className="flex-1">
                      Export as PNG
                    </Button>
                    <Button onClick={() => handleExport('pdf')} className="flex-1">
                      Export as PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetLayout(datasetId)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Layout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Period Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Selected Periods</label>
                  <Select
                    value={selectedPeriods.length > 0 ? selectedPeriods.join(',') : 'none'}
                    onValueChange={(value) => setSelectedPeriods(value === 'none' ? [] : value.split(','))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No periods selected</SelectItem>
                      {availablePeriods.map(period => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Compare With</label>
                  <Select
                    value={compareWith || 'none'}
                    onValueChange={(value) => setCompareWith(value === 'none' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select comparison period" />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No comparison</SelectItem>
                    {availablePeriods.map(period => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Toggle
                    pressed={showComparison}
                    onPressedChange={setShowComparison}
                  >
                    Show Comparison
                  </Toggle>
                </div>
              </CardContent>
            </Card>

            {/* Widget Library */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Widget Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentLayout.widgets.map(widget => (
                  <div key={widget.id} className="flex items-center justify-between">
                    <span className="text-sm">{widget.title}</span>
                    <Toggle
                      pressed={widget.visible}
                      onPressedChange={(pressed) => handleWidgetToggle(widget.id, pressed)}
                    >
                      {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Toggle>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: currentLayout.widgets.filter(w => w.visible).map(w => ({
                i: w.id,
                x: w.layout?.x || 0,
                y: w.layout?.y || 0,
                w: w.layout?.w || 6,
                h: w.layout?.h || 4,
              })) }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={60}
              onLayoutChange={handleLayoutChange}
              isDraggable={true}
              isResizable={true}
            >
              {currentLayout.widgets
                .filter(widget => widget.visible)
                .map(widget => (
                  <div key={widget.id} className="widget">
                    {renderWidget(widget)}
                  </div>
                ))}
            </ResponsiveGridLayout>
          </div>
        </div>
      </div>
    </div>
  );
}
