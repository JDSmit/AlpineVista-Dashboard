# Alpine Vista Financial Dashboard

A modern, interactive financial dashboard for senior living facilities. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 📊 **Interactive Widgets**: Drag, drop, and resize financial widgets
- 📈 **Real-time Charts**: Revenue trends, EBITDA waterfalls, and expense breakdowns
- 📋 **Excel Import**: Upload and map Excel financial data with auto-detection
- 🔄 **Period Comparison**: Compare different time periods side-by-side
- 💾 **Persistent Storage**: Layout and data saved locally
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Layout**: react-grid-layout for drag & drop
- **State**: Zustand
- **Excel Parsing**: xlsx (SheetJS)
- **Validation**: Zod
- **Testing**: Vitest

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Seed Sample Data

To get started quickly with sample data:

```bash
npm run seed
# or
yarn seed
# or
pnpm seed
```

This will create 6 months of sample financial data for the Alpine Vista facility.

## Usage

### 1. Upload Excel Data

1. Click "Upload New Data" on the home page
2. Select your Excel file (.xlsx or .xls)
3. Choose the sheet containing your financial data
4. Map columns to standard fields:
   - **Required**: Period, Revenue Total, Labor Expense, Non-Labor Expense, Rent
   - **Optional**: Other Income, Depreciation, Interest, Census, ADR

### 2. Customize Dashboard

- **Drag & Drop**: Move widgets around the dashboard
- **Resize**: Adjust widget sizes by dragging corners
- **Show/Hide**: Toggle widget visibility from the sidebar
- **Filters**: Select time periods and comparison periods

### 3. Available Widgets

- **KPI Cards**: Key metrics with trend indicators
- **Revenue Line Chart**: Monthly revenue trends
- **EBITDA Waterfall**: Revenue breakdown to NOI
- **Opex Breakdown**: Labor vs non-labor expenses
- **NOI Trend**: Net Operating Income over time
- **Detail Table**: Complete financial data with export

## Data Model

The dashboard expects financial data in this format:

```typescript
interface FacilityPeriod {
  id: string
  facilityName: string
  period: string        // YYYY-MM format
  currency: string
  values: {
    revenueTotal: number
    laborExpense: number
    nonLaborExpense: number
    rent: number
    otherIncome?: number
    depreciation?: number
    interest?: number
    census?: number
    adr?: number
  }
}
```

## Excel Auto-Mapping

The system automatically detects common column names:

- **Revenue**: "Total Revenue", "Revenue", "Net Revenue"
- **Labor**: "Labor", "Salaries", "Payroll", "Wages"
- **Non-Labor**: "Non-Labor", "Supplies", "Operating Expenses"
- **Rent**: "Rent", "Lease Expense"
- **Period**: "Month", "Period", "Date"

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui base components
│   ├── widgets/        # Dashboard widgets
│   ├── upload/         # Excel upload components
│   └── mapping/        # Column mapping wizard
├── lib/                # Utilities and business logic
│   ├── schema.ts       # Zod schemas and types
│   ├── metrics.ts      # Financial calculations
│   ├── format.ts       # Display formatting
│   ├── storage.ts      # localStorage helpers
│   └── excel.ts        # Excel parsing
└── store/              # Zustand state management
```

### Adding Custom Widgets

1. Create a new component in `src/components/widgets/`
2. Add the widget type to `WidgetConfigSchema` in `src/lib/schema.ts`
3. Register the widget in the dashboard renderer
4. Add to the default layout in `src/store/layout.ts`

Example widget:

```typescript
// src/components/widgets/CustomWidget.tsx
interface CustomWidgetProps {
  data: FacilityPeriod[]
  selectedPeriods: string[]
  compareWith?: string | null
}

export function CustomWidget({ data, selectedPeriods, compareWith }: CustomWidgetProps) {
  // Your widget implementation
}
```

### Testing

Run tests with:

```bash
npm run test
# or
yarn test
# or
pnpm test
```

### Linting

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

Build the project:

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

Create `.env.local`:

```env
# Optional: Enable database persistence
PERSIST_TO_DB=true

# Optional: Custom storage key prefix
STORAGE_PREFIX=altavista
```

### Customization

- **Colors**: Modify `tailwind.config.js`
- **Components**: Customize shadcn/ui components
- **Widgets**: Add new widgets in `src/components/widgets/`
- **Metrics**: Extend calculations in `src/lib/metrics.ts`

## Troubleshooting

### Common Issues

1. **Excel parsing fails**: Ensure your Excel file has proper headers and data
2. **Widgets not loading**: Check browser console for errors
3. **Layout not saving**: Verify localStorage is enabled
4. **Charts not rendering**: Ensure data is properly formatted

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.
