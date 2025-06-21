# Massachusetts Retirement System - Database Setup Guide

## 🚨 CRITICAL: Database Tables Missing

The production Supabase database is missing the required tables, causing HTTP 500 errors on all API endpoints.

## 📋 SOLUTION STEPS

### **Option 1: Supabase Dashboard (RECOMMENDED)**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `retirement_DB`

2. **Access SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Copy the entire contents of `prisma/production-setup.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `User`
     - `Account` 
     - `Session`
     - `RetirementProfile`
     - `RetirementCalculation`
     - `EmailLog`

### **Option 2: Command Line (Alternative)**

If you have `psql` installed locally:

```bash
# Connect to Supabase database
psql "postgresql://postgres.omiqpphkibfqddmwruuc:cwExuZuEgsZ29mXD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Run the setup script
\i prisma/production-setup.sql

# Verify tables
\dt
```

### **Option 3: Prisma Migration (Advanced)**

If you want to use Prisma migrations:

```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

## 🔍 VERIFICATION STEPS

After running the setup script:

### **1. Check Tables in Supabase**
- Go to Supabase Dashboard → Table Editor
- Verify all 6 tables exist with correct columns

### **2. Test API Health Check**
```bash
curl https://v0-mass-retire-new.vercel.app/api/health
```
Should return:
```json
{
  "status": "healthy",
  "checks": {
    "database": {"status": "pass"},
    "email": {"status": "pass"},
    "memory": {"status": "pass"},
    "disk": {"status": "pass"}
  }
}
```

### **3. Test Profile API**
```bash
curl https://v0-mass-retire-new.vercel.app/api/profile
```
Should return `401 Unauthorized` (not 500 error)

## 📊 DATABASE SCHEMA OVERVIEW

### **Core Tables Created:**

1. **User** - NextAuth users + subscription data
2. **Account** - OAuth account linking
3. **Session** - NextAuth session management
4. **RetirementProfile** - User retirement information
5. **RetirementCalculation** - Saved calculations
6. **EmailLog** - Email tracking and rate limiting

### **Key Features:**
- ✅ Foreign key constraints for data integrity
- ✅ Indexes for query performance
- ✅ Automatic timestamp updates
- ✅ UUID support for unique IDs
- ✅ Cascade deletes for cleanup

## 🚨 TROUBLESHOOTING

### **If Tables Still Don't Exist:**

1. **Check Supabase Connection**
   - Verify DATABASE_URL in Vercel environment variables
   - Test connection in Supabase Dashboard

2. **Manual Table Creation**
   - Copy each CREATE TABLE statement individually
   - Run them one by one in SQL Editor

3. **Permission Issues**
   - Ensure you have admin access to the Supabase project
   - Check if RLS (Row Level Security) is blocking operations

### **If API Still Returns 500:**

1. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Functions
   - Look for specific error messages

2. **Verify Environment Variables**
   - Ensure DATABASE_URL matches exactly:
   ```
   postgresql://postgres.omiqpphkibfqddmwruuc:cwExuZuEgsZ29mXD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

3. **Redeploy Application**
   - After database setup, trigger a new deployment
   - Wait 2-3 minutes for changes to propagate

## ✅ SUCCESS INDICATORS

When setup is complete, you should see:

- ✅ Health check returns "healthy" status
- ✅ API endpoints return 401 (not 500) for unauthenticated requests
- ✅ All 6 tables visible in Supabase Table Editor
- ✅ No "table does not exist" errors in Vercel logs

## 🎯 NEXT STEPS

After database setup:

1. Test user registration and login
2. Verify profile creation and updates
3. Test retirement calculations
4. Monitor Vercel function logs for any remaining issues

---

**Need Help?** Check Vercel function logs for specific error messages and ensure all environment variables are correctly set.
