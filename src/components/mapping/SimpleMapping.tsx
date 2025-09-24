'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface SimpleMappingProps {
  fileName: string;
  onMappingComplete: () => void;
  onBack: () => void;
}

export function SimpleMapping({ fileName, onMappingComplete, onBack }: SimpleMappingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [facilityName, setFacilityName] = useState('Alpine Vista');
  const [mappings, setMappings] = useState({
    period: '',
    revenue: '',
    labor: '',
    nonLabor: '',
    rent: '',
  });

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
      onMappingComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep(1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return facilityName.trim() !== '';
    }
    if (currentStep === 2) {
      return Object.values(mappings).every(value => value.trim() !== '');
    }
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Step {currentStep} of 2</span>
          <div className="flex-1 h-2 bg-muted rounded-full">
            <div 
              className="h-2 bg-primary rounded-full transition-all"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold">
          {currentStep === 1 ? 'Facility Information' : 'Map Excel Columns'}
        </h2>
        <p className="text-muted-foreground">
          {currentStep === 1 
            ? 'Enter the facility name for this dataset'
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
                <div className="p-3 bg-muted rounded-md">
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
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map your Excel columns to our standard financial fields. 
              Look at your Excel file and enter the exact column names.
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
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">💡 Mapping Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Look at the first row of your Excel file to find column names</li>
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
