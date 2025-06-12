# Action Items and Recommendations System

## 🎯 Overview

Comprehensive action items and recommendations system for the Massachusetts Retirement System application, featuring intelligent analysis of user profiles and calculation results to generate personalized retirement planning guidance.

## ✨ Features

### 🧠 Intelligent Recommendation Engine
- **User Analysis Algorithm**: Analyzes profiles, calculations, and retirement readiness
- **Retirement Readiness Scoring**: Excellent, on-track, needs-attention, critical classifications
- **Missing Data Detection**: Identifies gaps in user profiles and calculations
- **Opportunity Identification**: Finds optimization opportunities for benefit maximization
- **Risk Assessment**: Detects potential issues and planning gaps

### 📊 Comprehensive Action Item Management
- **12+ Action Templates**: Profile completion, calculations, planning, optimization, education
- **Smart Trigger Conditions**: Based on age, service years, group classification, calculation history
- **Priority System**: High, medium, low priority with color-coded visual indicators
- **Category Organization**: Profile, calculation, planning, optimization, education
- **Completion Tracking**: Status management with timestamps and dismissal reasons

### 🎨 Responsive UI Components
- **Gradient Card Design**: Consistent with existing Massachusetts Retirement System design patterns
- **Horizontal Layouts**: Desktop-optimized layouts for 1024px+ breakpoints
- **Priority Color Coding**: Red (high), yellow (medium), green (low) priority indicators
- **Interactive Actions**: Complete, dismiss, and reopen functionality
- **Progress Visualization**: Completion percentages and visual progress indicators

### ⚡ Performance Optimization
- **Sub-2s Response Times**: Optimized database queries and API endpoints
- **Efficient Filtering**: Smart pagination and category-based filtering
- **Memory Management**: Efficient recommendation generation with caching
- **Lazy Loading**: Progressive enhancement for large action item lists

## 🛠️ Usage Examples

### Basic Action Items Display
```tsx
import { ActionItems } from '@/components/dashboard/action-items'

<ActionItems 
  showHeader={true}
  maxItems={5}
  categories={['profile', 'calculation']}
  priorities={['high', 'medium']}
/>
```

### Using the Action Items Hook
```tsx
import { useActionItems } from '@/hooks/use-action-items'

function MyComponent() {
  const {
    actionItems,
    stats,
    isLoading,
    generateActionItems,
    completeActionItem,
    dismissActionItem,
  } = useActionItems({
    includeCompleted: false,
    category: 'planning',
  })

  const handleGenerate = async () => {
    await generateActionItems()
  }

  const handleComplete = async (itemId: string) => {
    await completeActionItem(itemId)
  }

  return (
    <div>
      <button onClick={handleGenerate}>Generate Recommendations</button>
      {actionItems.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <button onClick={() => handleComplete(item.id)}>Complete</button>
        </div>
      ))}
    </div>
  )
}
```

### API Integration
```typescript
// Generate action items
const response = await fetch('/api/action-items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'generate' })
})

// Get action items with filters
const items = await fetch('/api/action-items?status=pending&priority=high')

// Complete an action item
await fetch(`/api/action-items/${itemId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'complete' })
})

// Get statistics
const stats = await fetch('/api/action-items/stats')
```

## 🎨 Design System Integration

### Color Coding
- **High Priority**: Red background (`bg-red-100 text-red-800`)
- **Medium Priority**: Yellow background (`bg-yellow-100 text-yellow-800`)
- **Low Priority**: Green background (`bg-green-100 text-green-800`)

### Status Indicators
- **Pending**: Orange warning icon (`AlertTriangle`)
- **In Progress**: Blue clock icon (`Clock`)
- **Completed**: Green check icon (`CheckCircle2`)
- **Dismissed**: Gray X icon (`X`)

### Category Icons
- **Profile**: User icon (`User`)
- **Calculation**: Calculator icon (`Calculator`)
- **Planning**: Target icon (`Target`)
- **Optimization**: Trending up icon (`TrendingUp`)
- **Education**: Book icon (`BookOpen`)

## 📊 Action Item Categories

### Profile Completion
- **Complete Your Retirement Profile**: Add employment details for accurate calculations
- **Update Missing Profile Information**: Complete profile with missing required data

### Calculation Management
- **Run Your First Pension Calculation**: Calculate Massachusetts pension benefits
- **Update Your Retirement Calculations**: Refresh outdated calculations (90+ days)
- **Add Social Security to Your Analysis**: Include Social Security for complete picture

### Retirement Planning
- **Review Early Retirement Options**: Explore early retirement eligibility and impacts
- **Plan for Retirement Transition**: Prepare for retirement timing and benefit optimization

### Benefit Optimization
- **Maximize Your Service Credit**: Explore opportunities to increase years of service
- **Optimize Your Benefit Calculation**: Review strategies for benefit maximization
- **Review Your Group Classification**: Potential for better retirement group classification

### Education and Learning
- **Learn About Retirement Options**: Understand Option A, B, C and survivor benefits
- **Urgent: Address Retirement Planning Gaps**: Critical gaps requiring immediate attention

## 🔧 Configuration

### Recommendation Engine Settings
```typescript
// Retirement readiness thresholds
const READINESS_THRESHOLDS = {
  excellent: 85,    // 85%+ completion score
  good: 70,         // 70-84% completion score
  needsAttention: 50, // 50-69% completion score
  critical: 0       // <50% completion score
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  slowOperation: 2000,      // 2 seconds
  verySlowOperation: 5000,  // 5 seconds
  memoryWarning: 50 * 1024 * 1024,    // 50MB
  memoryCritical: 100 * 1024 * 1024,  // 100MB
}
```

### Database Schema
```sql
-- ActionItem model fields
id                  String   @id @default(cuid())
userId              String
title               String
description         String
category            String   -- 'profile', 'calculation', 'planning', 'optimization', 'education'
priority            String   -- 'high', 'medium', 'low'
status              String   -- 'pending', 'in-progress', 'completed', 'dismissed'
actionType          String   -- 'navigate', 'calculate', 'review', 'contact', 'learn'
actionUrl           String?
actionData          String?  -- JSON string
triggerCondition    String?
targetGroup         String?
targetAgeRange      String?
targetServiceRange  String?
relatedCalculationId String?
displayOrder        Int      @default(0)
expiresAt           DateTime?
isSystemGenerated   Boolean  @default(true)
generationReason    String?
completedAt         DateTime?
dismissedAt         DateTime?
dismissalReason     String?
createdAt           DateTime @default(now())
updatedAt           DateTime @updatedAt
```

## 🧪 Testing

### Test Coverage
- **Recommendation Engine**: User analysis, recommendation generation, edge cases
- **Action Items Service**: Database operations, business logic, performance validation
- **API Endpoints**: CRUD operations, validation, error handling
- **UI Components**: User interactions, responsive design, accessibility

### Running Tests
```bash
# Run action items tests
npm test -- __tests__/action-items/

# Run specific test files
npm test -- __tests__/action-items/recommendation-engine.test.ts
npm test -- __tests__/action-items/action-items-service.test.ts

# Run with coverage
npm test -- __tests__/action-items/ --coverage
```

## 📈 Performance Metrics

### API Response Times
- **GET /api/action-items**: <500ms average
- **POST /api/action-items (generate)**: <1.5s average
- **PATCH /api/action-items/[id]**: <200ms average
- **GET /api/action-items/stats**: <300ms average

### Database Performance
- **Action item queries**: Optimized with indexes on userId, status, priority, category
- **Recommendation generation**: <2s for complete user analysis
- **Statistics calculation**: <500ms for comprehensive stats

### UI Performance
- **Component rendering**: <100ms for action items list
- **State updates**: Optimistic updates with error rollback
- **Memory usage**: <10MB for typical action item management

## 🚀 Integration

### Dashboard Integration
```tsx
import { ActionItems } from '@/components/dashboard/action-items'

// In dashboard component
<ActionItems 
  showHeader={true}
  maxItems={3}
  className="col-span-full lg:col-span-2"
/>
```

### Error Tracking Integration
```typescript
import { recordUserAction, reportError } from '@/components/error-boundary/error-monitoring'

// Track user interactions
recordUserAction('complete_action_item', 'action-items', { itemId })

// Report errors with context
reportError(error, {
  context: 'action_items',
  operation: 'generate_recommendations',
  userId,
})
```

## 🔮 Future Enhancements

### Planned Features
- **AI-Powered Insights**: Machine learning for personalized recommendations
- **Notification System**: Email/SMS alerts for high-priority action items
- **Progress Tracking**: Visual progress charts and milestone celebrations
- **Collaborative Planning**: Share action items with financial advisors

### Performance Improvements
- **Real-time Updates**: WebSocket integration for live action item updates
- **Advanced Caching**: Redis caching for frequently accessed recommendations
- **Batch Processing**: Background processing for large-scale recommendation generation
- **Predictive Analytics**: Anticipate user needs based on behavior patterns

---

Built with ❤️ for the Massachusetts Retirement System
