'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { ExcelParseResult, ColumnMapping, FacilityPeriod } from '@/lib/schema';
import { autoDetectMappings, parseDataWithMappings, validateParsedData } from '@/lib/excel';
import { formatPeriod } from '@/lib/format';

interface MappingWizardProps {
  parseResult: ExcelParseResult;
  onComplete: (periods: FacilityPeriod[], warnings: string[]) => void;
  onCancel: () => void;
}

export function MappingWizard({ parseResult, onComplete, onCancel }: MappingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [mappings, setMappings] = useState<Partial<ColumnMapping>>({});
  const [facilityName, setFacilityName] = useState('Alpine Vista');
  const [previewData, setPreviewData] = useState<FacilityPeriod[]>([]);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } | null>(null);

  // Auto-detect mappings when sheet is selected
  useEffect(() => {
    if (selectedSheet && parseResult.data[selectedSheet]) {
      const autoMappings = autoDetectMappings(
        selectedSheet,
        parseResult.data[selectedSheet],
        parseResult.headers[selectedSheet]
      );
      setMappings(autoMappings);
    }
  }, [selectedSheet, parseResult]);

  // Generate preview when mappings change
  useEffect(() => {
    if (selectedSheet && Object.keys(mappings).length > 0) {
      try {
        const periods = parseDataWithMappings(
          parseResult.data[selectedSheet],
          parseResult.headers[selectedSheet],
          mappings as ColumnMapping,
          facilityName
        );
        setPreviewData(periods);
        
        const validationResult = validateParsedData(periods);
        setValidation(validationResult);
      } catch (error) {
        setValidation({
          isValid: false,
          warnings: [],
          errors: [error instanceof Error ? error.message : 'Failed to parse data'],
        });
      }
    }
  }, [selectedSheet, mappings, facilityName, parseResult]);

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Complete the mapping
      if (validation?.isValid && previewData.length > 0) {
        onComplete(previewData, validation.warnings);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return selectedSheet !== '';
    }
    if (currentStep === 2) {
      return validation?.isValid && previewData.length > 0;
    }
    return false;
  };

  const requiredFields = [
    { key: 'period', label: 'Period', required: true },
    { key: 'revenueTotal', label: 'Revenue Total', required: true },
    { key: 'laborExpense', label: 'Labor Expense', required: true },
    { key: 'nonLaborExpense', label: 'Non-Labor Expense', required: true },
    { key: 'rent', label: 'Rent', required: true },
  ];

  const optionalFields = [
    { key: 'otherIncome', label: 'Other Income' },
    { key: 'depreciation', label: 'Depreciation' },
    { key: 'interest', label: 'Interest' },
    { key: 'census', label: 'Census' },
    { key: 'adr', label: 'Average Daily Rate' },
  ];

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
          {currentStep === 1 ? 'Select Data Sheet' : 'Map Columns'}
        </h2>
        <p className="text-muted-foreground">
          {currentStep === 1 
            ? 'Choose which sheet contains your financial data'
            : 'Map the columns in your Excel file to our standard fields'
          }
        </p>
      </div>

      <Tabs value={currentStep.toString()} className="w-full">
        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Sheets</CardTitle>
              <CardDescription>
                Select the sheet that contains your monthly financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {parseResult.sheets.map((sheetName) => (
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
                          {parseResult.data[sheetName]?.length || 0} rows, {parseResult.headers[sheetName]?.length || 0} columns
                        </p>
                      </div>
                      {selectedSheet === sheetName && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Facility Information</CardTitle>
                <CardDescription>
                  Enter the name of the facility for this data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="Alpine Vista"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Column Mapping</CardTitle>
                <CardDescription>
                  Map your Excel columns to our standard financial fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Required Fields</h4>
                  <div className="grid gap-3">
                    {requiredFields.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <label className="w-32 text-sm font-medium">
                          {field.label}
                        </label>
                        <Select
                          value={mappings[field.key as keyof ColumnMapping] || ''}
                          onValueChange={(value) => handleMappingChange(field.key as keyof ColumnMapping, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {parseResult.headers[selectedSheet]?.map((header, index) => (
                              <SelectItem key={index} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Optional Fields</h4>
                  <div className="grid gap-3">
                    {optionalFields.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <label className="w-32 text-sm font-medium">
                          {field.label}
                        </label>
                        <Select
                          value={mappings[field.key as keyof ColumnMapping] || ''}
                          onValueChange={(value) => handleMappingChange(field.key as keyof ColumnMapping, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select column (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {parseResult.headers[selectedSheet]?.map((header, index) => (
                              <SelectItem key={index} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {previewData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    Preview of parsed data ({previewData.length} periods found)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {previewData.slice(0, 3).map((period) => (
                      <div key={period.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{formatPeriod(period.period)}</span>
                          <span className="text-sm text-muted-foreground">
                            Revenue: ${period.values.revenueTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {previewData.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        ... and {previewData.length - 3} more periods
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {validation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Data Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validation.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Errors:</h4>
                      {validation.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                      ))}
                    </div>
                  )}
                  {validation.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-600">Warnings:</h4>
                      {validation.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-yellow-600">{warning}</p>
                      ))}
                    </div>
                  )}
                  {validation.isValid && validation.warnings.length === 0 && (
                    <p className="text-sm text-green-600">Data looks good! Ready to import.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={currentStep === 1 ? onCancel : handleBack}>
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
            'Complete Import'
          )}
        </Button>
      </div>
    </div>
  );
}
