'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleUploader } from '@/components/upload/SimpleUploader';
import { EnhancedMapping } from '@/components/mapping/EnhancedMapping';
import { Upload, BarChart3, Building } from 'lucide-react';

export default function HomePage() {
  const [showUpload, setShowUpload] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUploaded = (fileName: string) => {
    setUploadedFileName(fileName);
    setShowUpload(false);
    setShowMapping(true);
  };

  const handleMappingComplete = () => {
    setShowMapping(false);
    setShowUpload(false);
    // Navigate to the cumulative dashboard
    window.location.href = '/dashboard-cumulative';
  };

  const handleBackToUpload = () => {
    setShowMapping(false);
    setShowUpload(true);
  };

  const handleBackToHome = () => {
    setShowUpload(false);
    setShowMapping(false);
  };

  if (showMapping) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <EnhancedMapping
            fileName={uploadedFileName}
            onMappingComplete={handleMappingComplete}
            onBack={handleBackToUpload}
          />
        </div>
      </div>
    );
  }

  if (showUpload) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <SimpleUploader onFileUploaded={handleFileUploaded} />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleBackToHome}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Alpine Vista Financial Dashboard</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track and analyze financial performance for senior living facilities
          </p>
          
          <Button size="lg" className="mr-4" onClick={() => setShowUpload(true)}>
            <Upload className="h-5 w-5 mr-2" />
            Upload New Data
          </Button>
        </div>

        {/* Sample Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Alpine Vista
                </CardTitle>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  6 periods
                </span>
              </div>
              <CardDescription>
                Sample Financial Data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Jan 2024 - Jun 2024</span>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full" onClick={() => window.location.href = '/dashboard-cumulative'}>
                    Open Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Sample Facility
                </CardTitle>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  12 periods
                </span>
              </div>
              <CardDescription>
                Demo Dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Jan 2023 - Dec 2023</span>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full" onClick={() => window.location.href = '/dashboard-cumulative'}>
                    Open Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Dashboard Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-blue-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Excel Import</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and map Excel financial data with smart column detection
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-green-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Interactive Charts</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag, drop, and resize widgets to customize your dashboard
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-purple-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Financial KPIs</h3>
                  <p className="text-sm text-muted-foreground">
                    Track revenue, EBITDA, NOI, and other key financial metrics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-orange-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Period Comparison</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare different time periods and analyze trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}