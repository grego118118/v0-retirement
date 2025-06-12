# Scenario Comparison Visualization Components

## 🎯 Overview

Comprehensive visualization components for comparing retirement scenarios in the Massachusetts Retirement System. These components provide interactive tables, charts, and dashboards to help users analyze and optimize their retirement strategies.

## ✨ Features

### 📊 **ScenarioComparisonTable**
- **Side-by-side comparison** of key metrics across scenarios
- **Interactive sorting** by income, risk, tax efficiency, and other metrics
- **Optimal indicators** highlighting best scenarios for each metric
- **Risk badges** with color-coded risk levels
- **Responsive design** with mobile-friendly layouts
- **Export functionality** for comparison data

### 📈 **ScenarioComparisonCharts**
- **Multiple chart types**: Bar charts, line charts, area charts
- **Interactive visualizations** with hover tooltips and click events
- **Time horizon controls** for lifetime projections
- **Scenario visibility toggles** for focused analysis
- **Responsive charts** that adapt to screen size
- **Export capabilities** for charts and underlying data

### 🎛️ **ScenarioComparisonDashboard**
- **Comprehensive overview** with optimal scenario summaries
- **AI-powered recommendations** for strategy optimization
- **Tabbed interface** switching between overview, table, and charts
- **Priority-based recommendations** with actionable insights
- **Export functionality** for complete analysis reports

## 🚀 Quick Start

### Basic Usage

```tsx
import { 
  ScenarioComparisonDashboard,
  ScenarioComparisonTable,
  ScenarioComparisonCharts 
} from '@/components/scenario-modeling'

// Complete dashboard with all features
<ScenarioComparisonDashboard
  scenarios={scenarios}
  results={results}
  onExportReport={handleExport}
  onSelectOptimalScenario={handleScenarioSelection}
/>

// Standalone comparison table
<ScenarioComparisonTable
  scenarios={scenarios}
  results={results}
  showOptimalIndicators={true}
  onExport={handleTableExport}
/>

// Interactive charts only
<ScenarioComparisonCharts
  scenarios={scenarios}
  results={results}
  onExport={handleChartExport}
/>
```

### Data Requirements

```tsx
// Scenarios with calculation results
const scenarios: RetirementScenario[] = [
  {
    id: 'scenario-1',
    name: 'Early Retirement',
    description: 'Retire at 62 with reduced benefits',
    isBaseline: true,
    personalParameters: { retirementAge: 62, ... },
    pensionParameters: { retirementGroup: '1', ... },
    socialSecurityParameters: { claimingAge: 62, ... },
    // ... other parameters
  }
]

const results: ScenarioResults[] = [
  {
    scenarioId: 'scenario-1',
    pensionBenefits: { monthlyBenefit: 3500, ... },
    socialSecurityBenefits: { monthlyBenefit: 1875, ... },
    incomeProjections: { totalMonthlyIncome: 5375, ... },
    taxAnalysis: { effectiveTaxRate: 0.15, ... },
    keyMetrics: { riskScore: 7, flexibilityScore: 5, ... }
  }
]
```

## 📊 Component Details

### ScenarioComparisonTable

**Props:**
- `scenarios: RetirementScenario[]` - Array of scenarios to compare
- `results: ScenarioResults[]` - Calculation results for each scenario
- `showOptimalIndicators?: boolean` - Show crown icons for optimal scenarios
- `compactView?: boolean` - Use compact layout for mobile
- `onExport?: () => void` - Export callback function

**Features:**
- **Sortable columns** for all key metrics
- **Metric filtering** to focus on specific comparisons
- **Optimal indicators** highlighting best scenarios
- **Risk level badges** with color coding
- **Comparison icons** showing relative performance
- **Responsive breakpoints** at 375px, 768px, 1024px, 1920px

### ScenarioComparisonCharts

**Props:**
- `scenarios: RetirementScenario[]` - Array of scenarios to compare
- `results: ScenarioResults[]` - Calculation results for each scenario
- `onExport?: () => void` - Export callback function

**Chart Types:**
1. **Income Comparison** - Stacked bar chart of pension + Social Security
2. **Lifetime Projections** - Line chart showing income over time
3. **Risk Analysis** - Multi-metric bar chart for risk assessment
4. **Tax Efficiency** - Bar chart comparing effective tax rates

**Interactive Features:**
- **Tab navigation** between chart types
- **Time horizon selection** for projections (1 year, 5 years, 10 years, lifetime)
- **Scenario visibility toggles** for lifetime projections
- **Hover tooltips** with detailed information
- **Reference lines** for target values

### ScenarioComparisonDashboard

**Props:**
- `scenarios: RetirementScenario[]` - Array of scenarios to compare
- `results: ScenarioResults[]` - Calculation results for each scenario
- `onExportReport?: () => void` - Export complete report
- `onSelectOptimalScenario?: (scenarioId: string) => void` - Scenario selection callback

**Dashboard Sections:**
1. **Overview Tab**
   - Optimal scenario summary cards
   - AI-powered recommendations with priority levels
   - Quick action buttons for optimal scenarios

2. **Table Tab**
   - Full ScenarioComparisonTable component
   - All sorting and filtering capabilities

3. **Charts Tab**
   - Complete ScenarioComparisonCharts component
   - All interactive visualization features

## 🎨 Styling & Theming

### Color Schemes
- **Blue (#3B82F6)**: Pension benefits
- **Green (#10B981)**: Social Security benefits
- **Purple (#8B5CF6)**: Combined metrics
- **Orange (#F59E0B)**: Tax-related metrics
- **Red (#EF4444)**: High risk indicators

### Responsive Design
- **Mobile (375px-768px)**: Stacked layouts, simplified charts
- **Tablet (768px-1024px)**: Balanced grid layouts
- **Desktop (1024px+)**: Full feature set, side-by-side comparisons
- **Large Desktop (1920px+)**: Enhanced spacing and typography

### Accessibility
- **WCAG 2.1 AA compliance** with proper contrast ratios
- **Screen reader support** with descriptive labels
- **Keyboard navigation** for all interactive elements
- **Color-blind friendly** palette with pattern differentiation
- **Focus indicators** for all interactive components

## ⚡ Performance

### Optimization Features
- **Virtualized tables** for large scenario sets (>25 scenarios)
- **Chart memoization** to prevent unnecessary re-renders
- **Debounced interactions** for smooth user experience
- **Lazy loading** for complex visualizations
- **Sub-2-second rendering** requirement compliance

### Performance Metrics
- **Initial render**: < 500ms for up to 10 scenarios
- **Chart transitions**: < 200ms animation duration
- **Table sorting**: < 100ms for up to 50 scenarios
- **Export operations**: < 2 seconds for complete reports

## 🧪 Testing

### Test Coverage
- **18 comprehensive tests** covering all components
- **Unit tests** for individual component functionality
- **Integration tests** for component interactions
- **Accessibility tests** for WCAG compliance
- **Performance tests** for rendering benchmarks

### Test Categories
1. **Rendering Tests** - Component display and data binding
2. **Interaction Tests** - User interactions and state changes
3. **Export Tests** - Data export functionality
4. **Responsive Tests** - Breakpoint behavior
5. **Accessibility Tests** - Screen reader and keyboard navigation

## 🔧 Configuration

### Default Configurations
```tsx
import { 
  DEFAULT_SCENARIO_CONFIGS,
  COMPARISON_CHART_CONFIGS,
  COMPARISON_TABLE_CONFIGS 
} from '@/components/scenario-modeling'

// Use predefined scenario templates
const earlyRetirement = DEFAULT_SCENARIO_CONFIGS.earlyRetirement

// Apply chart configuration presets
const chartConfig = COMPARISON_CHART_CONFIGS.incomeComparison
```

### Customization Options
- **Chart colors** and styling themes
- **Table column** selection and ordering
- **Performance thresholds** for large datasets
- **Export formats** and templates
- **Accessibility settings** for enhanced support

## 📈 Integration

### With Existing Systems
- **Scenario Calculator** - Automatic result integration
- **PDF Generation** - Export comparison reports
- **Dashboard Components** - Embedded visualizations
- **Authentication** - User-specific scenario access
- **Database** - Persistent scenario storage

### API Integration
```tsx
// Fetch scenarios and results
const { scenarios, results } = await fetchScenarioComparison(userId)

// Generate comparison analysis
const comparison = compareScenarios(scenarios, results)

// Export comprehensive report
await exportComparisonReport(comparison, { format: 'pdf' })
```

## 🚀 Future Enhancements

### Planned Features
- **Real-time collaboration** for shared scenario analysis
- **Advanced filtering** with custom criteria
- **Scenario templates** for common retirement strategies
- **Monte Carlo visualization** for risk analysis
- **Mobile app integration** for on-the-go analysis

### Performance Improvements
- **WebGL rendering** for complex visualizations
- **Service worker caching** for offline analysis
- **Progressive loading** for large datasets
- **Background calculations** for improved responsiveness
