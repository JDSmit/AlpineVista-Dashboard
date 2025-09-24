import * as XLSX from 'xlsx';
import { FacilityPeriod, ColumnMapping, ExcelParseResult } from './schema';

/**
 * Parse Excel workbook and extract data from sheets
 */
export function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: string[] = [];
        const dataMap: Record<string, any[][]> = {};
        const headersMap: Record<string, string[]> = {};
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: '',
            raw: false 
          }) as any[][];
          
          sheets.push(sheetName);
          dataMap[sheetName] = jsonData;
          
          // Extract headers (first non-empty row)
          const headers = jsonData.find(row => 
            row.some(cell => cell && cell.toString().trim() !== '')
          ) || [];
          headersMap[sheetName] = headers.map(h => h?.toString() || '');
        });
        
        resolve({
          sheets,
          data: dataMap,
          headers: headersMap,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Auto-detect column mappings based on heuristics
 */
export function autoDetectMappings(
  sheetName: string, 
  data: any[][], 
  headers: string[]
): Partial<ColumnMapping> {
  const mappings: Partial<ColumnMapping> = {};
  
  // Find the "Actual" column
  let actualColumnIndex = -1;
  const actualColumnPatterns = [
    /^actual$/i,
    /actual/i,
  ];
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase() || '';
    if (actualColumnPatterns.some(pattern => pattern.test(header))) {
      actualColumnIndex = i;
      break;
    }
  }
  
  // If no "Actual" column found, use the first numeric column
  if (actualColumnIndex === -1) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase() || '';
      if (header.includes('amount') || header.includes('value') || header.includes('total')) {
        actualColumnIndex = i;
        break;
      }
    }
  }
  
  // Find period column
  const periodPatterns = [
    /^period$/i,
    /^month$/i,
    /^date$/i,
    /period/i,
    /month/i,
  ];
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase() || '';
    if (periodPatterns.some(pattern => pattern.test(header))) {
      mappings.period = headers[i];
      break;
    }
  }
  
  // Scan rows for financial metrics
  const rowLabels: string[] = [];
  const rowValues: number[] = [];
  
  for (let rowIndex = 0; rowIndex < Math.min(data.length, 50); rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;
    
    const firstCell = row[0]?.toString().toLowerCase().trim();
    if (!firstCell) continue;
    
    rowLabels.push(firstCell);
    
    // Try to get numeric value from the actual column
    if (actualColumnIndex >= 0 && actualColumnIndex < row.length) {
      const value = parseFloat(row[actualColumnIndex]);
      if (!isNaN(value)) {
        rowValues.push(value);
      } else {
        rowValues.push(0);
      }
    } else {
      rowValues.push(0);
    }
  }
  
  // Map financial metrics using regex patterns
  const patterns = {
    revenueTotal: [
      /total\s*operating\s*revenue/i,
      /total\s*revenue/i,
      /operating\s*revenue/i,
      /revenue/i,
    ],
    laborExpense: [
      /salar(y|ies)/i,
      /wages/i,
      /payroll/i,
      /labor/i,
    ],
    nonLaborExpense: [
      /non[-\s]*labor/i,
      /supplies/i,
      /operating\s*expenses/i,
      /other\s*opex/i,
      /g&a/i,
      /general\s*&\s*admin/i,
      /utilities/i,
    ],
    rent: [
      /rent/i,
      /lease\s*expense/i,
    ],
    depreciation: [
      /depreciation/i,
    ],
    interest: [
      /interest/i,
    ],
  };
  
  // Find matches for each metric
  Object.entries(patterns).forEach(([metric, metricPatterns]) => {
    for (let i = 0; i < rowLabels.length; i++) {
      const label = rowLabels[i];
      if (metricPatterns.some(pattern => pattern.test(label))) {
        mappings[metric as keyof ColumnMapping] = label;
        break;
      }
    }
  });
  
  return mappings;
}

/**
 * Parse data using column mappings to create FacilityPeriod objects
 */
export function parseDataWithMappings(
  data: any[][],
  headers: string[],
  mappings: ColumnMapping,
  facilityName = 'Alpine Vista'
): FacilityPeriod[] {
  const periods: FacilityPeriod[] = [];
  const periodIndex = headers.findIndex(h => h === mappings.period);
  
  if (periodIndex === -1) {
    throw new Error('Period column not found in mappings');
  }
  
  // Create column index map
  const columnMap: Record<string, number> = {};
  Object.entries(mappings).forEach(([key, value]) => {
    if (value && key !== 'period') {
      const index = headers.findIndex(h => h === value);
      if (index !== -1) {
        columnMap[key] = index;
      }
    }
  });
  
  // Parse each row
  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    if (!row || row.length === 0) continue;
    
    const periodValue = row[periodIndex]?.toString().trim();
    if (!periodValue) continue;
    
    // Normalize period to YYYY-MM format
    const normalizedPeriod = normalizePeriod(periodValue);
    if (!normalizedPeriod) continue;
    
    // Extract values
    const values: any = {
      revenueTotal: 0,
      laborExpense: 0,
      nonLaborExpense: 0,
      rent: 0,
    };
    
    Object.entries(columnMap).forEach(([key, colIndex]) => {
      if (colIndex < row.length) {
        const value = parseFloat(row[colIndex]);
        if (!isNaN(value)) {
          values[key] = Math.abs(value); // Ensure positive values
        }
      }
    });
    
    // Validate required fields
    if (values.revenueTotal === 0 && values.laborExpense === 0 && values.nonLaborExpense === 0) {
      continue; // Skip empty rows
    }
    
    const period: FacilityPeriod = {
      id: `${facilityName}-${normalizedPeriod}`,
      facilityName,
      period: normalizedPeriod,
      currency: 'USD',
      values,
    };
    
    periods.push(period);
  }
  
  return periods;
}

/**
 * Normalize period string to YYYY-MM format
 */
function normalizePeriod(periodStr: string): string | null {
  // Handle various date formats
  const date = new Date(periodStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  
  // Handle YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(periodStr)) {
    return periodStr;
  }
  
  // Handle MM/YYYY format
  const mmYyyyMatch = periodStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYyyyMatch) {
    const month = mmYyyyMatch[1].padStart(2, '0');
    const year = mmYyyyMatch[2];
    return `${year}-${month}`;
  }
  
  return null;
}

/**
 * Validate parsed data for common issues
 */
export function validateParsedData(periods: FacilityPeriod[]): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (periods.length === 0) {
    errors.push('No valid data found in the Excel file');
    return { isValid: false, warnings, errors };
  }
  
  // Check for revenue < rent (potential data issue)
  periods.forEach(period => {
    if (period.values.revenueTotal < period.values.rent) {
      warnings.push(
        `Revenue (${period.values.revenueTotal}) is less than rent (${period.values.rent}) for ${period.period}`
      );
    }
  });
  
  // Check for missing periods
  const sortedPeriods = periods.map(p => p.period).sort();
  for (let i = 1; i < sortedPeriods.length; i++) {
    const prev = new Date(sortedPeriods[i - 1] + '-01');
    const curr = new Date(sortedPeriods[i] + '-01');
    const diffMonths = (curr.getFullYear() - prev.getFullYear()) * 12 + 
                     (curr.getMonth() - prev.getMonth());
    
    if (diffMonths > 1) {
      warnings.push(`Gap detected between ${sortedPeriods[i - 1]} and ${sortedPeriods[i]}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}
