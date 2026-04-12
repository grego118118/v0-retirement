# Error Tracking and Monitoring System

## 🎯 Overview

Comprehensive error tracking and monitoring system for the Massachusetts Retirement System application, built with Sentry SDK and optimized for production reliability, performance monitoring, and user experience.

## ✨ Features

### 🛡️ Error Boundary Components
- **ErrorBoundary**: Main error boundary with retry functionality and user reporting
- **AsyncErrorBoundary**: Specialized for async operations and network errors  
- **ChartErrorBoundary**: Chart-specific error handling with data download capabilities
- **Comprehensive Error UI**: Technical details, recovery options, and user-friendly messaging

### 📊 Error Monitoring System
- **ErrorMonitor**: Singleton class for centralized error tracking
- **User Action Tracking**: Breadcrumb trails and interaction monitoring
- **Performance Metrics**: Automatic slow operation detection and alerting
- **Memory Monitoring**: Usage tracking with threshold alerts
- **Network Monitoring**: Request performance and failure tracking

### 🔍 Contextual Error Reporting
- **Retirement Context**: Calculation-specific error tracking (user group, age, years of service)
- **User Context**: Integration with authentication system
- **Session Correlation**: Error analysis across user sessions
- **Automatic Categorization**: Calculation, chart, network, and performance errors

### ⚡ Performance Monitoring
- **Sub-2s Operation Monitoring**: Automatic alerts for slow operations
- **Memory Usage Tracking**: 50MB/100MB threshold monitoring
- **Long Task Detection**: UI performance optimization insights
- **Network Performance**: 5-second timeout alerts and analysis

## 🛠️ Usage Examples

### Basic Error Boundary
```tsx
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary level="component" showReportButton={true}>
  <YourComponent />
</ErrorBoundary>
```

### Async Error Handling
```tsx
import { AsyncErrorBoundary, useAsyncErrorHandler } from '@/components/error-boundary'

function AsyncComponent() {
  const { executeAsync, error, isLoading } = useAsyncErrorHandler()
  
  const handleOperation = () => {
    executeAsync(async () => {
      // Your async operation
      const result = await fetchData()
      return result
    })
  }
  
  return (
    <AsyncErrorBoundary>
      {/* Your component content */}
    </AsyncErrorBoundary>
  )
}
```

### Chart Error Protection
```tsx
import { ChartErrorBoundary } from '@/components/error-boundary'

<ChartErrorBoundary 
  chartTitle="Benefit Projection"
  chartData={data}
  showDataDownload={true}
>
  <YourChartComponent />
</ChartErrorBoundary>
```

### Error Monitoring Integration
```tsx
import { useErrorReporting } from '@/components/error-boundary'

function CalculatorComponent() {
  const { reportCalculationError, recordUserAction } = useErrorReporting()
  
  const handleCalculation = async () => {
    recordUserAction('calculate', 'pension-calculator')
    
    try {
      const result = await calculatePension(data)
      return result
    } catch (error) {
      reportCalculationError(error, { calculationData: data })
      throw error
    }
  }
}
```

## 🎨 Error Boundary Types

### Page-Level Error Boundary
```tsx
import { PageErrorBoundary } from '@/components/error-boundary'

<PageErrorBoundary>
  <YourPageComponent />
</PageErrorBoundary>
```

### Component-Level Error Boundary
```tsx
import { ComponentErrorBoundary } from '@/components/error-boundary'

<ComponentErrorBoundary>
  <YourComponent />
</ComponentErrorBoundary>
```

### Critical Error Boundary
```tsx
import { CriticalErrorBoundary } from '@/components/error-boundary'

<CriticalErrorBoundary>
  <CriticalSystemComponent />
</CriticalErrorBoundary>
```

## 🔧 Configuration

### Sentry Configuration
```typescript
// Environment variables required
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### Error Monitoring Setup
```typescript
import { errorMonitor, setUserContext, setCalculationContext } from '@/components/error-boundary'

// Set user context
setUserContext({
  id: 'user123',
  email: 'user@example.com',
  group: 'GROUP_1'
})

// Set calculation context
setCalculationContext({
  calculationType: 'pension',
  userGroup: 'GROUP_1',
  retirementAge: 65,
  yearsOfService: 30
})
```

## 📈 Performance Monitoring

### Operation Monitoring
```typescript
import { monitorAsyncOperation } from '@/components/error-boundary'

const result = await monitorAsyncOperation(
  async () => {
    // Your operation
    return await expensiveCalculation()
  },
  'pension_calculation',
  { userId: 'user123' }
)
```

### Performance Thresholds
- **Slow Operation**: 2 seconds
- **Very Slow Operation**: 5 seconds  
- **Memory Warning**: 50MB
- **Memory Critical**: 100MB

## 🧪 Testing

### Error Boundary Tests
```bash
# Run error boundary tests
npm test -- __tests__/error-tracking/error-boundary.test.tsx

# Run error monitoring tests  
npm test -- __tests__/error-tracking/error-monitoring.test.ts
```

### Test Coverage
- **Error Boundary Components**: User interaction simulation and retry functionality
- **Error Monitoring System**: Performance validation and context tracking
- **Async Error Handling**: Network simulation and recovery testing
- **Chart Error Handling**: Data export and visualization error recovery

## 🚀 Integration

### HOC Integration
```typescript
import { withErrorBoundary } from '@/components/error-boundary'

const SafeComponent = withErrorBoundary(YourComponent, {
  level: 'component',
  showReportButton: true
})
```

### Hook Integration
```typescript
import { useErrorHandler, useErrorReporting } from '@/components/error-boundary'

function YourComponent() {
  const { handleError, clearError } = useErrorHandler()
  const { reportCalculationError } = useErrorReporting()
  
  // Use error handling capabilities
}
```

### Context Provider Integration
```tsx
import { ErrorProvider } from '@/components/error-boundary'

function App() {
  return (
    <ErrorProvider>
      <YourAppContent />
    </ErrorProvider>
  )
}
```

## 📊 Error Categories

### Automatic Categorization
- **Authentication**: Login/logout and session errors
- **Calculation**: Pension and Social Security calculation errors
- **Chart**: Data visualization and rendering errors
- **Database**: Data persistence and retrieval errors
- **Network**: API requests and connectivity errors
- **Performance**: Slow operations and memory issues
- **UI**: Component rendering and interaction errors
- **Validation**: Form validation and data validation errors

## 🔔 Alert Configuration

### Critical Error Alerts
- **Automatic Reporting**: Critical errors are automatically reported to Sentry
- **User Notification**: User-friendly error messages with recovery options
- **Development Alerts**: Detailed technical information in development mode
- **Performance Alerts**: Automatic alerts for operations exceeding thresholds

### Alert Thresholds
- **Error Rate**: >5% error rate triggers alerts
- **Performance**: >2s operation time triggers warnings
- **Memory**: >50MB usage triggers monitoring alerts
- **Network**: >5s request time triggers performance alerts

## 🛡️ Security and Privacy

### Data Protection
- **PII Filtering**: Personally identifiable information is filtered from error reports
- **Sensitive Data Masking**: Form inputs and sensitive data are masked in session replays
- **Context Sanitization**: Error context is sanitized before transmission
- **User Consent**: Error reporting respects user privacy preferences

### Security Features
- **Error Filtering**: Development and non-actionable errors are filtered out
- **Rate Limiting**: Error reporting is rate-limited to prevent spam
- **Secure Transmission**: All error data is transmitted securely via HTTPS
- **Access Control**: Error data access is restricted to authorized personnel

## 📈 Future Enhancements

### Planned Features
- **Real-time Dashboards**: Live error monitoring and performance dashboards
- **Predictive Analytics**: ML-based error prediction and prevention
- **Advanced Alerting**: Custom alert rules and notification channels
- **Error Recovery**: Automated error recovery and self-healing capabilities

### Performance Improvements
- **Edge Computing**: Error processing at edge locations for faster response
- **Intelligent Sampling**: Dynamic sampling based on error patterns
- **Batch Processing**: Efficient batch processing of error data
- **Caching**: Intelligent caching of error patterns and solutions

---

Built with ❤️ for the Massachusetts Retirement System
