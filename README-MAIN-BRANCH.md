# Massachusetts Retirement System - Core Application

## 🎯 Production-Ready Core Features

This is the **main branch** containing stable, production-ready features for immediate deployment.

### ✅ Available Features

#### **Core Functionality**
- **Home Page**: Overview of Massachusetts Retirement System
- **Pension Calculator**: Basic pension benefit calculations for Groups 1-4
- **User Dashboard**: Personal retirement overview and saved calculations
- **User Authentication**: Google OAuth integration
- **User Profile Management**: Personal information and preferences
- **Blog System**: Retirement planning articles and insights

#### **Supported Retirement Groups**
- **Group 1**: General employees
- **Group 2**: Certain public safety (probation officers, court officers)
- **Group 3**: State Police
- **Group 4**: Public safety (police, firefighters, corrections)

#### **Calculation Features**
- Pension benefit calculations with accurate multipliers
- Retirement eligibility verification
- Multiple retirement options (A, B, C)
- Service credit calculations
- Basic projection tables

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your Google OAuth credentials

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

### 📁 Core Architecture

```
app/
├── page.tsx                 # Home page
├── calculator/              # Basic pension calculator
├── dashboard/               # User dashboard
├── profile/                 # User profile management
├── blog/                    # Blog system
├── auth/                    # Authentication pages
├── about/                   # About page
├── contact/                 # Contact page
├── faq/                     # FAQ page
└── api/                     # Core API endpoints

components/
├── pension-calculator.tsx   # Main calculator component
├── pension-results.tsx      # Results display
├── dashboard/               # Dashboard components
├── profile/                 # Profile components
├── auth/                    # Authentication components
├── ui/                      # Shared UI library
└── layout/                  # Layout components

lib/
├── standardized-pension-calculator.ts  # Core calculation logic
├── pension-calculations.ts             # Pension formulas
├── auth/                               # Authentication utilities
├── prisma.ts                          # Database client
└── utils.ts                           # Shared utilities
```

### 🔧 Configuration

#### **Environment Variables**
```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Production Authentication
# NEXTAUTH_URL="https://www.masspension.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### **Database Schema**
- Users and authentication
- Pension calculations and saved results
- User profiles and preferences
- Blog posts and content

### 📊 Performance Requirements
- ✅ Sub-2-second calculation response times
- ✅ Responsive design (375px - 1920px)
- ✅ 44px minimum touch targets
- ✅ WCAG 2.1 AA compliance
- ✅ SEO optimized

### 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance
```

### 🚀 Deployment

This branch is deployment-ready for:
- **Vercel**: Zero-config deployment
- **Netlify**: Static site generation
- **Docker**: Containerized deployment
- **Traditional hosting**: Node.js applications

```bash
# Build for production
npm run build

# Start production server
npm start
```

### 🔗 Related Branches

- **`dev-features`**: Advanced features under development
  - Scenario modeling and comparison
  - Tax calculator integration
  - Combined calculation wizard
  - Advanced Social Security features

### 📞 Support

For questions about the core application:
- Check the FAQ page
- Review the documentation
- Contact the development team

---

**Note**: This core application provides essential retirement calculation functionality. Advanced features like scenario modeling and tax calculations are available in the `dev-features` branch for continued development.
