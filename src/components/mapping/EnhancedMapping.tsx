'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, CheckCircle, FileSpreadsheet } from 'lucide-react';

interface EnhancedMappingProps {
  fileName: string;
  onMappingComplete: () => void;
  onBack: () => void;
}

export function EnhancedMapping({ fileName, onMappingComplete, onBack }: EnhancedMappingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [facilityName, setFacilityName] = useState('Alpine Vista');
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [mappings, setMappings] = useState({
    period: '',
    revenue: '',
    labor: '',
    nonLabor: '',
    rent: '',
  });

  // Simulate loading sheet names (in real implementation, this would come from the uploaded file)
  useEffect(() => {
    // Simulate the sheet names from your Excel file
    const mockSheetNames = [
      'Month-End P&L',
      'T-12 Single Community', 
      'Balance Sheet Detail',
      'General Ledger',
      'Rent Roll',
      'Detail & Explanations'
    ];
    setSheetNames(mockSheetNames);
  }, []);

  const requiredFields = [
    { key: 'period', label: 'Period', placeholder: 'e.g., Month, Date, Period' },
    { key: 'revenue', label: 'Revenue Total', placeholder: 'e.g., Total Revenue, Revenue' },
    { key: 'labor', label: 'Labor Expense', placeholder: 'e.g., Labor, Salaries, Payroll' },
    { key: 'nonLabor', label: 'Non-Labor Expense', placeholder: 'e.g., Non-Labor, Supplies' },
    { key: 'rent', label: 'Rent', placeholder: 'e.g., Rent, Lease Expense' },
  ];

  const handleMappingChange = (field: string, value: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      onMappingComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return facilityName.trim() !== '';
    }
    if (currentStep === 2) {
      return selectedSheet !== '';
    }
    if (currentStep === 3) {
      return Object.values(mappings).every(value => value.trim() !== '');
    }
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Step {currentStep} of 3</span>
          <div className="flex-1 h-2 bg-muted rounded-full">
            <div 
              className="h-2 bg-primary rounded-full transition-all"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold">
          {currentStep === 1 ? 'Facility Information' : 
           currentStep === 2 ? 'Select Data Sheet' : 'Map Excel Columns'}
        </h2>
        <p className="text-muted-foreground">
          {currentStep === 1 
            ? 'Enter the facility name for this dataset'
            : currentStep === 2
            ? 'Choose which sheet contains your monthly financial data'
            : 'Map your Excel columns to our standard financial fields'
          }
        </p>
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
            <CardDescription>
              Enter the name of the facility for this financial data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Facility Name</label>
                <Input
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="Alpine Vista"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">File Name</label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{fileName}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Sheets</CardTitle>
            <CardDescription>
              Select the sheet that contains your monthly financial data. 
              Typically this would be "Month-End P&L" or similar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {sheetNames.map((sheetName) => (
                <div
                  key={sheetName}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSheet === sheetName
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSheet(sheetName)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{sheetName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sheetName === 'Month-End P&L' ? 'Recommended - Contains monthly P&L data' :
                         sheetName === 'T-12 Single Community' ? 'Contains 12-month rolling data' :
                         sheetName === 'Rent Roll' ? 'Contains rent and occupancy data' :
                         'Contains detailed financial information'}
                      </p>
                    </div>
                    {selectedSheet === sheetName && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">💡 Sheet Selection Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Month-End P&L</strong> - Usually contains monthly revenue and expense data</li>
                <li>• <strong>T-12 Single Community</strong> - Contains 12-month rolling financial data</li>
                <li>• <strong>Rent Roll</strong> - Contains rent and occupancy information</li>
                <li>• Look for sheets with monthly columns or period data</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map your Excel columns to our standard financial fields. 
              Look at the "{selectedSheet}" sheet and enter the exact column names.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                {requiredFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-4">
                    <label className="w-32 text-sm font-medium">
                      {field.label}
                    </label>
                    <Input
                      value={mappings[field.key as keyof typeof mappings]}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1"
                    />
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-900 mb-2">✅ Selected Sheet: {selectedSheet}</h4>
                <p className="text-sm text-green-800">
                  We'll extract data from the "{selectedSheet}" sheet using your column mappings.
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">💡 Mapping Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Look at the first row of your "{selectedSheet}" sheet to find column names</li>
                  <li>• Enter the exact column name as it appears in Excel</li>
                  <li>• Common names: "Month" for period, "Total Revenue" for revenue</li>
                  <li>• Case doesn't matter - we'll find the right column</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>
          {currentStep === 1 ? 'Cancel' : <><ArrowLeft className="h-4 w-4 mr-2" />Back</>}
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isStepValid()}
        >
          {currentStep === 1 ? (
            <>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : currentStep === 2 ? (
            <>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Complete Import<CheckCircle className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
