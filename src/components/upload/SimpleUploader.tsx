'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

interface SimpleUploaderProps {
  onFileUploaded: (fileName: string) => void;
}

export function SimpleUploader({ onFileUploaded }: SimpleUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (file: File) => {
    if (file) {
      setFileName(file.name);
      setUploadStatus('uploading');
      
      // Simulate upload process
      setTimeout(() => {
        setUploadStatus('success');
        onFileUploaded(file.name);
      }, 1500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type.includes('spreadsheet') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls')
    );
    
    if (excelFile) {
      handleFileSelect(excelFile);
    } else {
      setUploadStatus('error');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragOver 
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
          </label>
        </div>

        {uploadStatus === 'uploading' && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Processing Excel file...</span>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 rounded-md bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Successful!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              File "{fileName}" has been uploaded and is ready for mapping.
            </p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please upload a valid Excel file (.xlsx or .xls format).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
