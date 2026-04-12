-- Massachusetts Retirement System - Production Database Setup
-- This script creates all required tables for the Prisma schema in Supabase PostgreSQL

-- Enable UUID extension (required for cuid() default values)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User table (NextAuth + Application data)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "retirementDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionPlan" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" TIMESTAMP(3),
    "socialSecurityCalculations" INTEGER NOT NULL DEFAULT 0,
    "wizardUses" INTEGER NOT NULL DEFAULT 0,
    "pdfReports" INTEGER NOT NULL DEFAULT 0,
    "lastUsageReset" TIMESTAMP(3),
    "emailPreferences" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Account table (NextAuth OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Session table (NextAuth)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create RetirementProfile table
CREATE TABLE IF NOT EXISTS "RetirementProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "membershipDate" TIMESTAMP(3) NOT NULL,
    "retirementGroup" TEXT NOT NULL,
    "benefitPercentage" DOUBLE PRECISION NOT NULL,
    "currentSalary" DOUBLE PRECISION NOT NULL,
    "averageHighest3Years" DOUBLE PRECISION,
    "yearsOfService" DOUBLE PRECISION,
    "retirementDate" TIMESTAMP(3),
    "retirementOption" TEXT,
    "estimatedSocialSecurityBenefit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RetirementProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create RetirementCalculation table
CREATE TABLE IF NOT EXISTS "RetirementCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "calculationName" TEXT,
    "retirementDate" TIMESTAMP(3) NOT NULL,
    "retirementAge" INTEGER NOT NULL,
    "yearsOfService" DOUBLE PRECISION NOT NULL,
    "averageSalary" DOUBLE PRECISION NOT NULL,
    "retirementGroup" TEXT NOT NULL,
    "benefitPercentage" DOUBLE PRECISION NOT NULL,
    "retirementOption" TEXT NOT NULL,
    "monthlyBenefit" DOUBLE PRECISION NOT NULL,
    "annualBenefit" DOUBLE PRECISION NOT NULL,
    "benefitReduction" DOUBLE PRECISION,
    "survivorBenefit" DOUBLE PRECISION,
    "socialSecurityData" TEXT,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RetirementCalculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create EmailLog table
CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "RetirementCalculation_userId_idx" ON "RetirementCalculation"("userId");
CREATE INDEX IF NOT EXISTS "RetirementCalculation_createdAt_idx" ON "RetirementCalculation"("createdAt");
CREATE INDEX IF NOT EXISTS "EmailLog_userId_idx" ON "EmailLog"("userId");
CREATE INDEX IF NOT EXISTS "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");
CREATE INDEX IF NOT EXISTS "EmailLog_type_idx" ON "EmailLog"("type");

-- Create function to automatically update updatedAt timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updatedAt updates
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retirement_profile_updated_at BEFORE UPDATE ON "RetirementProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retirement_calculation_updated_at BEFORE UPDATE ON "RetirementCalculation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('User', 'Account', 'Session', 'RetirementProfile', 'RetirementCalculation', 'EmailLog')
ORDER BY tablename;
