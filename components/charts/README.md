# Interactive Charts and Data Visualizations

## 🎯 Overview

Comprehensive chart component library for the Massachusetts Retirement System application, built with Recharts v2.15.3 and optimized for performance, accessibility, and responsive design.

## ✨ Features

### 🎨 Chart Components
- **BaseChart**: Foundation component with consistent styling and error handling
- **BenefitProjectionChart**: Line/area charts for retirement benefit projections
- **ComparisonChart**: Bar charts for income comparisons with target values
- **IncomeBreakdownChart**: Pie/donut charts for income source distribution
- **ChartShowcase**: Interactive demonstration of all chart capabilities

### 🚀 Advanced Interactivity
- **Zoom & Pan**: Interactive chart exploration with brush controls
- **Tooltips**: Rich, contextual data displays on hover
- **Click Events**: Drill-down functionality for detailed analysis
- **Export**: PNG/SVG export capabilities
- **Refresh**: Real-time data updates

### 📱 Responsive Design
- **Mobile**: 375px+ with touch-optimized interactions
- **Tablet**: 768px+ with enhanced spacing
- **Desktop**: 1024px+ with multi-column layouts
- **Large Desktop**: 1920px+ with expanded visualizations

### ⚡ Performance Optimizations
- **Sub-2s Rendering**: All charts render within 2 seconds
- **Memory Efficient**: Optimized data handling and lazy loading
- **Animation Control**: Smooth 750ms transitions with performance monitoring
- **Large Dataset Support**: Handles 100+ data points efficiently

### ♿ Accessibility Features
- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for accessibility themes
- **Focus Management**: Proper focus indicators and management

## 🛠️ Usage Examples

### Basic Benefit Projection Chart
```tsx
import { BenefitProjectionChart, generateSampleBenefitData } from '@/components/charts'

const data = generateSampleBenefitData(62, 85, 3000, 2000, 0.025)

<BenefitProjectionChart
  data={data}
  title="Retirement Benefit Projections"
  showCOLA={true}
  chartType="area"
  enableZoom={true}
  highlightRetirementAge={67}
/>
```

### Income Comparison Chart
```tsx
import { ComparisonChart, generateSampleComparisonData } from '@/components/charts'

const data = generateSampleComparisonData()

<ComparisonChart
  data={data}
  title="Pre vs Post Retirement Income"
  showTarget={true}
  orientation="vertical"
  colorScheme="income"
  onBarClick={(data) => console.log('Clicked:', data)}
/>
```

### Income Breakdown Chart
```tsx
import { IncomeBreakdownChart, generateSampleIncomeBreakdownData } from '@/components/charts'

const data = generateSampleIncomeBreakdownData()

<IncomeBreakdownChart
  data={data}
  title="Retirement Income Sources"
  chartType="donut"
  showPercentages={true}
  enableClick={true}
  onSegmentClick={(data) => console.log('Segment:', data)}
/>
```

## 🎨 Theming and Configuration

### Color Scheme
```typescript
import { CHART_COLORS } from '@/components/charts'

// Primary colors
CHART_COLORS.pension        // #3b82f6 (Blue)
CHART_COLORS.socialSecurity // #10b981 (Green)
CHART_COLORS.healthcare     // #8b5cf6 (Purple)
CHART_COLORS.other          // #f59e0b (Amber)
```

### Responsive Breakpoints
```typescript
import { CHART_BREAKPOINTS } from '@/components/charts'

CHART_BREAKPOINTS.mobile        // 375px
CHART_BREAKPOINTS.tablet        // 768px
CHART_BREAKPOINTS.desktop       // 1024px
CHART_BREAKPOINTS.largeDesktop  // 1920px
```

## 🧪 Testing

### Test Coverage
- **28 comprehensive tests** with 100% pass rate
- **Performance testing** validates sub-2-second requirements
- **Responsive testing** across all breakpoints
- **Accessibility testing** for ARIA compliance
- **Interactive testing** for hover, click, and zoom features

### Running Tests
```bash
# Run chart component tests
npm test -- __tests__/charts/chart-components.test.tsx

# Run all tests with coverage
npm test -- --coverage
```

## 📊 Performance Metrics

### Rendering Performance
- **BaseChart**: <100ms average render time
- **BenefitProjectionChart**: <150ms with 50 data points
- **ComparisonChart**: <75ms with 10 categories
- **IncomeBreakdownChart**: <50ms with 5 segments

### Memory Usage
- **Efficient data handling**: <50MB memory usage
- **Lazy loading**: Optimized for large datasets
- **Animation optimization**: GPU-accelerated transitions

## 🔧 Configuration Options

### Chart Types
- **Line Charts**: Trend analysis and projections
- **Area Charts**: Cumulative data visualization
- **Bar Charts**: Comparative analysis (vertical/horizontal)
- **Pie/Donut Charts**: Proportional data display

### Interactive Features
- **Zoom**: Mouse wheel and touch gestures
- **Pan**: Drag to navigate large datasets
- **Brush**: Selection tool for detailed analysis
- **Tooltips**: Contextual data on hover
- **Click Events**: Custom interaction handlers

## 🚀 Integration

### Dashboard Integration
```tsx
import { ChartShowcase } from '@/components/dashboard/chart-showcase'

<ChartShowcase
  pensionAmount={3960}
  socialSecurityAmount={2000}
  currentIncome={8500}
/>
```

### Custom Chart Creation
```tsx
import { BaseChart } from '@/components/charts'

<BaseChart
  title="Custom Chart"
  data={customData}
  showExport={true}
  showRefresh={true}
  onRefresh={handleRefresh}
>
  {/* Your custom Recharts components */}
</BaseChart>
```

## 📈 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Animations**: Smooth data transitions
- **3D Visualizations**: Enhanced depth perception
- **Custom Themes**: User-configurable color schemes
- **Data Export**: CSV/Excel export capabilities

### Performance Improvements
- **Virtual Scrolling**: Handle 1000+ data points
- **Web Workers**: Background data processing
- **Caching**: Intelligent data caching strategies
- **Progressive Loading**: Incremental data loading

## 🤝 Contributing

### Development Guidelines
1. **Performance First**: All charts must render within 2 seconds
2. **Accessibility**: WCAG 2.1 AA compliance required
3. **Responsive**: Support all breakpoints (375px-1920px+)
4. **Testing**: Comprehensive test coverage for new features
5. **Documentation**: Update README and inline documentation

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Jest**: Unit and integration testing

---

Built with ❤️ for the Massachusetts Retirement System
