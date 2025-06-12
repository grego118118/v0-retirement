# Massachusetts Retirement System - API Documentation

## Overview

The Massachusetts Retirement System API provides comprehensive endpoints for pension calculations, scenario modeling, user profile management, and retirement planning tools.

**Base URL**: `https://your-domain.com/api`
**Authentication**: NextAuth.js session-based authentication
**Rate Limiting**: Varies by endpoint (see individual endpoints)

---

## Authentication

All API endpoints require authentication unless otherwise specified. Authentication is handled via NextAuth.js sessions.

### Session Management

```typescript
// Check authentication status
GET /api/auth/session

// Sign in
POST /api/auth/signin

// Sign out
POST /api/auth/signout
```

---

## User Profile Management

### Get User Profile
```http
GET /api/profile
```

**Response:**
```json
{
  "fullName": "John Doe",
  "dateOfBirth": "1970-01-01",
  "membershipDate": "2000-01-01",
  "retirementGroup": "GROUP_1",
  "currentSalary": 75000,
  "averageHighest3Years": 80000,
  "yearsOfService": 25,
  "plannedRetirementAge": 65,
  "retirementOption": "A",
  "retirementDate": "2035-01-01",
  "benefitPercentage": 2.5,
  "hasProfile": true
}
```

### Update User Profile
```http
PUT /api/profile
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "dateOfBirth": "1970-01-01",
  "membershipDate": "2000-01-01",
  "retirementGroup": "GROUP_1",
  "currentSalary": 75000,
  "plannedRetirementAge": 65,
  "retirementOption": "A"
}
```

---

## Retirement Calculations

### Create Calculation
```http
POST /api/retirement/calculations
```

**Request Body:**
```json
{
  "name": "My Retirement Calculation",
  "retirementGroup": "GROUP_1",
  "retirementAge": 65,
  "yearsOfService": 30,
  "salary1": 75000,
  "salary2": 76000,
  "salary3": 77000,
  "retirementOption": "A"
}
```

**Response:**
```json
{
  "id": "calc_123",
  "name": "My Retirement Calculation",
  "monthlyBenefit": 3750,
  "annualBenefit": 45000,
  "benefitMultiplier": 2.5,
  "averageSalary": 76000,
  "replacementRatio": 59.2,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Get User Calculations
```http
GET /api/retirement/calculations?limit=20&offset=0&favorites=false
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `favorites` (optional): Filter favorites only (default: false)

### Get Single Calculation
```http
GET /api/retirement/calculations/[id]
```

### Update Calculation
```http
PUT /api/retirement/calculations/[id]
```

### Delete Calculation
```http
DELETE /api/retirement/calculations/[id]
```

---

## Scenario Modeling

### Create Scenario
```http
POST /api/scenarios
```

**Request Body:**
```json
{
  "name": "Conservative Retirement",
  "description": "Conservative approach with early retirement",
  "parameters": {
    "retirementAge": 62,
    "retirementGroup": "GROUP_1",
    "yearsOfService": 30,
    "currentSalary": 75000,
    "salaryGrowthRate": 0.03,
    "investmentReturn": 0.06,
    "riskTolerance": "conservative",
    "socialSecurityClaimAge": 67,
    "healthcareOption": "state_plan"
  }
}
```

**Response:**
```json
{
  "id": "scenario_123",
  "name": "Conservative Retirement",
  "description": "Conservative approach with early retirement",
  "isBaseline": false,
  "parameters": { /* scenario parameters */ },
  "results": {
    "totalMonthlyIncome": 4200,
    "pensionResults": {
      "monthlyBenefit": 2800,
      "annualBenefit": 33600
    },
    "socialSecurityResults": {
      "monthlyBenefit": 1400,
      "annualBenefit": 16800
    },
    "replacementRatio": 67.2,
    "riskScore": 3.2,
    "optimizationScore": 8.1
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Get User Scenarios
```http
GET /api/scenarios?search=&baseline=false
```

**Query Parameters:**
- `search` (optional): Search scenarios by name
- `baseline` (optional): Filter baseline scenarios only

### Get Single Scenario
```http
GET /api/scenarios/[id]
```

### Update Scenario
```http
PATCH /api/scenarios/[id]
```

### Scenario Actions
```http
POST /api/scenarios/[id]
```

**Request Body:**
```json
{
  "action": "duplicate" | "setBaseline" | "recalculate",
  "data": { /* action-specific data */ }
}
```

### Bulk Operations
```http
POST /api/scenarios/bulk
```

**Request Body:**
```json
{
  "action": "delete" | "duplicate" | "compare",
  "scenarioIds": ["scenario_1", "scenario_2"],
  "data": { /* action-specific data */ }
}
```

---

## Social Security Integration

### Calculate Social Security Benefits
```http
POST /api/social-security/calculate
```

**Request Body:**
```json
{
  "birthYear": 1970,
  "retirementAge": 67,
  "currentAge": 55,
  "annualEarnings": 75000,
  "earningsHistory": [/* array of annual earnings */],
  "spouseInfo": {
    "birthYear": 1972,
    "annualEarnings": 50000
  }
}
```

### Get COLA Projections
```http
GET /api/social-security/cola?years=20&currentBenefit=2000
```

---

## Tax Calculations

### Calculate Retirement Taxes
```http
POST /api/tax/calculate
```

**Request Body:**
```json
{
  "pensionIncome": 45000,
  "socialSecurityIncome": 20000,
  "otherIncome": 5000,
  "filingStatus": "single",
  "age": 65,
  "state": "MA"
}
```

**Response:**
```json
{
  "federal": {
    "taxableIncome": 55000,
    "tax": 8250,
    "effectiveRate": 15.0
  },
  "state": {
    "taxableIncome": 50000,
    "tax": 2500,
    "effectiveRate": 5.0
  },
  "total": {
    "grossIncome": 70000,
    "totalTax": 10750,
    "netIncome": 59250,
    "effectiveRate": 15.4
  }
}
```

---

## Action Items

### Get User Action Items
```http
GET /api/action-items?status=pending&priority=high
```

### Create Action Item
```http
POST /api/action-items
```

### Update Action Item
```http
PUT /api/action-items/[id]
```

---

## Health and Monitoring

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    },
    "memory": {
      "status": "healthy",
      "usagePercent": 65
    },
    "performance": {
      "status": "healthy",
      "pageLoad": { "p95": 1200 },
      "apiResponse": { "p95": 800 }
    }
  }
}
```

### Performance Metrics
```http
GET /api/metrics
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| API General | 30 requests | 1 minute |
| Calculations | 20 requests | 1 minute |
| General | 100 requests | 15 minutes |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

---

## Data Types

### Retirement Groups
- `GROUP_1`: General employees
- `GROUP_2`: Probation/court officers, certain corrections
- `GROUP_3`: State Police
- `GROUP_4`: Public safety/corrections/parole

### Retirement Options
- `A`: Maximum retirement allowance
- `B`: Reduced allowance with survivor benefit
- `C`: Reduced allowance with different survivor benefit

### Filing Status
- `single`: Single filer
- `marriedFilingJointly`: Married filing jointly
- `marriedFilingSeparately`: Married filing separately
- `headOfHousehold`: Head of household

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// Using fetch API
const response = await fetch('/api/retirement/calculations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Calculation',
    retirementGroup: 'GROUP_1',
    retirementAge: 65,
    yearsOfService: 30,
    salary1: 75000,
    salary2: 76000,
    salary3: 77000
  })
})

const calculation = await response.json()
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenarioData)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  
  const scenario = await response.json()
  return scenario
} catch (error) {
  console.error('API Error:', error.message)
  throw error
}
```

---

## Changelog

### Version 1.0.0 (2025-01-01)
- Initial API release
- User profile management
- Retirement calculations
- Scenario modeling
- Social Security integration
- Tax calculations
- Health monitoring

---

For additional support or questions, please contact the development team.
