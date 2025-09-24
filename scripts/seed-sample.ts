import { FacilityPeriod, Dataset } from '../src/lib/schema';
import { StorageManager } from '../src/lib/storage';

// Generate sample data for 6 months
function generateSampleData(): FacilityPeriod[] {
  const periods: FacilityPeriod[] = [];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() + i);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate realistic financial data with some variation
    const baseRevenue = 850000 + (Math.random() - 0.5) * 100000;
    const laborExpense = baseRevenue * (0.45 + (Math.random() - 0.5) * 0.05);
    const nonLaborExpense = baseRevenue * (0.25 + (Math.random() - 0.5) * 0.03);
    const rent = baseRevenue * (0.15 + (Math.random() - 0.5) * 0.02);
    
    const periodData: FacilityPeriod = {
      id: `alpine-vista-${period}`,
      facilityName: 'Alpine Vista',
      period,
      currency: 'USD',
      values: {
        revenueTotal: Math.round(baseRevenue),
        laborExpense: Math.round(laborExpense),
        nonLaborExpense: Math.round(nonLaborExpense),
        rent: Math.round(rent),
        otherIncome: Math.round(baseRevenue * 0.02 * Math.random()),
        depreciation: Math.round(baseRevenue * 0.08 * (0.8 + Math.random() * 0.4)),
        interest: Math.round(baseRevenue * 0.03 * (0.8 + Math.random() * 0.4)),
        census: Math.round(85 + (Math.random() - 0.5) * 10),
        adr: Math.round(280 + (Math.random() - 0.5) * 20),
      },
    };
    
    periods.push(periodData);
  }
  
  return periods;
}

// Create sample dataset
function createSampleDataset(): Dataset {
  const periods = generateSampleData();
  
  return {
    id: 'sample-dataset-1',
    name: 'Sample Financial Data',
    facilityName: 'Alpine Vista',
    periods,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Seed the data
function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');
    
    // Load existing datasets
    const existingDatasets = StorageManager.loadDatasets();
    
    // Check if sample data already exists
    const sampleExists = existingDatasets.some(d => d.id === 'sample-dataset-1');
    if (sampleExists) {
      console.log('✅ Sample data already exists');
      return;
    }
    
    // Create and save sample dataset
    const sampleDataset = createSampleDataset();
    const updatedDatasets = [...existingDatasets, sampleDataset];
    
    StorageManager.saveDatasets(updatedDatasets);
    
    console.log('✅ Sample data seeded successfully!');
    console.log(`📊 Created dataset with ${sampleDataset.periods.length} periods`);
    console.log(`📅 Period range: ${sampleDataset.periods[0].period} to ${sampleDataset.periods[sampleDataset.periods.length - 1].period}`);
    
    // Show sample data
    console.log('\n📈 Sample financial data:');
    sampleDataset.periods.forEach(period => {
      console.log(`${period.period}: Revenue $${period.values.revenueTotal.toLocaleString()}, EBITDA $${(period.values.revenueTotal - period.values.laborExpense - period.values.nonLaborExpense).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to seed sample data:', error);
  }
}

// Run the seeding
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  seedSampleData();
} else {
  console.log('This script should be run with Node.js, not in the browser');
}

export { seedSampleData };
