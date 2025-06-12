# Quick Actions Component - Usage Example

The improved Quick Actions component now features enhanced visual design, better spacing, and new functionality including pension growth projections.

## Updated Interface

```typescript
interface QuickActionsProps {
  hasCalculations?: boolean
  latestCalculation?: any
  onRefresh?: () => void
  isLoading?: boolean
  pensionProjection?: {
    currentAge: number
    retirementAge: number
    currentPension: number
    projectedPension: number
    yearsOfService: number
    maxBenefit: number
  }
  calculationStats?: {
    totalCalculations: number
    lastCalculationDate?: string
    retirementReadiness: 'on-track' | 'needs-attention' | 'excellent'
  }
}
```

## Usage Example

```tsx
import { QuickActions } from '@/components/dashboard/quick-actions'

// Example usage in a dashboard component
export function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Sample data - replace with actual data from your API/database
  const pensionProjection = {
    currentAge: 45,
    retirementAge: 65,
    currentPension: 45000,
    projectedPension: 72000,
    yearsOfService: 20,
    maxBenefit: 90000
  }
  
  const calculationStats = {
    totalCalculations: 5,
    lastCalculationDate: '2024-01-15',
    retirementReadiness: 'on-track' as const
  }
  
  const latestCalculation = {
    id: 'calc-123',
    createdAt: '2024-01-15T10:30:00Z'
  }
  
  const handleRefresh = async () => {
    setIsLoading(true)
    // Implement refresh logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }
  
  return (
    <div className="container mx-auto p-6">
      <QuickActions
        hasCalculations={true}
        latestCalculation={latestCalculation}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        pensionProjection={pensionProjection}
        calculationStats={calculationStats}
      />
    </div>
  )
}
```

## Key Improvements

### 1. Visual Design Enhancements
- **Gradient backgrounds** for cards and action buttons
- **Enhanced shadows** and hover effects
- **Better color coding** for different action types
- **Improved typography** with consistent sizing and spacing

### 2. Layout Improvements
- **Two-tier action system**: Primary actions (Essential Tools) and Secondary actions (Advanced Features)
- **Responsive grid layouts** that work on mobile and desktop
- **Consistent spacing** using Tailwind's space-y and gap utilities
- **Better visual hierarchy** with section headers and dividers

### 3. New Pension Growth Projection Section
- **Visual progress indicators** showing pension growth over time
- **Key metrics display** with current vs projected values
- **Progress bar** showing percentage of maximum benefit
- **Annual growth calculations** based on MA retirement system rules

### 4. Enhanced Resources & Settings
- **Categorized resource links** with proper icon alignment
- **Quick stats section** showing calculation history and readiness
- **Improved hover states** with smooth transitions
- **Better visual separation** using separators

### 5. Responsive Design
- **Mobile-first approach** with responsive grid layouts
- **Proper touch targets** for mobile devices
- **Scalable typography** that works across screen sizes
- **Optimized spacing** for different viewport sizes

## Styling Features

- **Gradient backgrounds** for visual appeal
- **Shadow system** for depth and hierarchy
- **Hover animations** with scale and shadow effects
- **Color-coded badges** for premium features
- **Consistent border radius** using rounded-xl
- **Proper contrast ratios** for accessibility
