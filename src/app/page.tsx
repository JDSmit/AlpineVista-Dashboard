'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WorkbookUploader } from '@/components/upload/WorkbookUploader';
import { MappingWizard } from '@/components/mapping/MappingWizard';
import { useDatasetsStore } from '@/store/datasets';
import { Dataset, FacilityPeriod, ExcelParseResult } from '@/lib/schema';
import { formatPeriod, formatPeriodRange } from '@/lib/format';
import { Upload, BarChart3, Calendar, Building } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { datasets, loadDatasets, addDataset } = useDatasetsStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [isMappingOpen, setIsMappingOpen] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  const handleFileParsed = (result: ExcelParseResult) => {
    setParseResult(result);
    setIsUploadOpen(false);
    setIsMappingOpen(true);
  };

  const handleMappingComplete = (periods: FacilityPeriod[], warnings: string[]) => {
    // Create new dataset
    const dataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: `Financial Data ${new Date().toLocaleDateString()}`,
      facilityName: periods[0]?.facilityName || 'Alpine Vista',
      periods,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addDataset(dataset);
    setIsMappingOpen(false);
    setParseResult(null);
    
    // Navigate to dashboard
    router.push(`/dashboard?datasetId=${dataset.id}`);
  };

  const handleMappingCancel = () => {
    setIsMappingOpen(false);
    setParseResult(null);
  };

  const handleOpenDashboard = (datasetId: string) => {
    router.push(`/dashboard?datasetId=${datasetId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Alpine Vista Financial Dashboard</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track and analyze financial performance for senior living facilities
          </p>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mr-4">
                <Upload className="h-5 w-5 mr-2" />
                Upload New Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Upload Financial Data</DialogTitle>
                <DialogDescription>
                  Upload your monthly Excel workbook to get started with the dashboard.
                </DialogDescription>
              </DialogHeader>
              <WorkbookUploader
                onFileParsed={handleFileParsed}
                onError={(error) => console.error('Upload error:', error)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Datasets Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {dataset.facilityName}
                  </CardTitle>
                  <Badge variant="secondary">
                    {dataset.periods.length} periods
                  </Badge>
                </div>
                <CardDescription>
                  {dataset.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatPeriodRange(dataset.periods.map(p => p.period))}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>
                      Last updated: {dataset.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => handleOpenDashboard(dataset.id)}
                      className="w-full"
                    >
                      Open Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {datasets.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first Excel file to start tracking financial performance
                  </p>
                  <Button onClick={() => setIsUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mapping Wizard */}
        {isMappingOpen && parseResult && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <MappingWizard
                parseResult={parseResult}
                onComplete={handleMappingComplete}
                onCancel={handleMappingCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
