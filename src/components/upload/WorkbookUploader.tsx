'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseExcelFile } from '@/lib/excel';
import { ExcelParseResult } from '@/lib/schema';

interface WorkbookUploaderProps {
  onFileParsed: (result: ExcelParseResult) => void;
  onError: (error: string) => void;
}

export function WorkbookUploader({ onFileParsed, onError }: WorkbookUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/excel',
        'application/x-excel',
        'application/x-msexcel',
      ];
      
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        throw new Error('Please upload a valid Excel file (.xlsx or .xls)');
      }

      // Parse the Excel file
      const result = await parseExcelFile(file);
      onFileParsed(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse Excel file';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onFileParsed, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Financial Data
        </CardTitle>
        <CardDescription>
          Upload your monthly Excel workbook from the facility manager to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {isDragActive 
                  ? 'Drop your Excel file here' 
                  : 'Drag & drop your Excel file here'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Supported formats: .xlsx, .xls</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Parsing Excel file...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
