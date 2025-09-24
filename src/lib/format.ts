/**
 * Format currency values for display
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number, decimals = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format number with thousands separators
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format period for display (e.g., "Jan 2024")
 */
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}

/**
 * Format period range for display
 */
export function formatPeriodRange(periods: string[]): string {
  if (periods.length === 0) return '';
  if (periods.length === 1) return formatPeriod(periods[0]);
  
  const sorted = periods.sort();
  const start = formatPeriod(sorted[0]);
  const end = formatPeriod(sorted[sorted.length - 1]);
  
  return `${start} - ${end}`;
}

/**
 * Format change indicator with color
 */
export function formatChange(percentage: number): {
  text: string;
  color: string;
  icon: string;
} {
  const abs = Math.abs(percentage);
  const sign = percentage >= 0 ? '+' : '';
  
  if (abs < 0.1) {
    return { text: '0.0%', color: 'text-gray-500', icon: '→' };
  }
  
  if (percentage > 0) {
    return { 
      text: `${sign}${abs.toFixed(1)}%`, 
      color: 'text-green-600', 
      icon: '↗' 
    };
  }
  
  return { 
    text: `${sign}${abs.toFixed(1)}%`, 
    color: 'text-red-600', 
    icon: '↘' 
  };
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toFixed(0);
}
