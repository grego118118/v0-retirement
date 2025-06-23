# Massachusetts Retirement System - Production Deployment Guide

This comprehensive guide covers the complete production deployment infrastructure for the Massachusetts Retirement System website, optimized for DigitalOcean hosting with sub-2-second performance requirements.

## 🏗️ **Infrastructure Overview**

### Architecture Components
- **Application**: Next.js 15 with TypeScript
- **Database**: PostgreSQL 15 with connection pooling and optimized indexes
- **Cache**: Redis for session and data caching with performance monitoring
- **Reverse Proxy**: Nginx with SSL termination and security headers
- **Monitoring**: Sentry for error tracking, performance monitoring, and observability
- **Containerization**: Docker with multi-stage builds and security optimizations
- **Orchestration**: Docker Compose for service management
- **Security**: Enhanced security configuration for government/financial compliance
- **Performance**: Query optimization and caching strategies for sub-2-second response times

## 🎯 **Production Optimization Features**

### Performance Enhancements
- **Database Indexes**: Comprehensive PostgreSQL indexes for optimal query performance
- **Query Optimization**: Optimized database queries with caching and timeout protection
- **Performance Monitoring**: Real-time performance tracking with threshold alerts
- **Cache Strategy**: Multi-level caching with Redis and application-level optimization

### Security Hardening
- **Enhanced Security Headers**: CSP, HSTS, and comprehensive security configuration
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: Configurable rate limiting for different endpoint types
- **Compliance**: Government/financial application security requirements

### Monitoring & Observability
- **Error Tracking**: Enhanced Sentry integration with contextual error reporting
- **Performance Metrics**: Real-time performance monitoring and alerting
- **Health Checks**: Comprehensive health monitoring with detailed diagnostics
- **Activity Tracking**: User activity and system performance tracking

---

## 🚀 **DigitalOcean Production Deployment**

### Prerequisites
- DigitalOcean account with billing enabled
- Domain name configured with DigitalOcean DNS
- GitHub repository with the Massachusetts Retirement System code
- Environment variables configured (see Environment Configuration section)

### Step 1: Database Setup (PostgreSQL)

1. **Create Managed PostgreSQL Database**
   ```bash
   # Via DigitalOcean CLI (optional)
   doctl databases create ma-retirement-db \
     --engine postgres \
     --version 15 \
     --size db-s-1vcpu-1gb \
     --region nyc1
   ```

2. **Configure Database Connection**
   - Note the connection string from DigitalOcean dashboard
   - Add to environment variables as `DATABASE_URL`
   - Enable SSL connections (required for production)

3. **Apply Database Optimizations**
   ```bash
   # Connect to database and run optimization script
   psql $DATABASE_URL -f prisma/migrations/20250611_production_indexes.sql
   ```

### Step 2: Redis Cache Setup

1. **Create Managed Redis Instance**
   ```bash
   # Via DigitalOcean CLI (optional)
   doctl databases create ma-retirement-redis \
     --engine redis \
     --version 7 \
     --size db-s-1vcpu-1gb \
     --region nyc1
   ```

2. **Configure Redis Connection**
   - Note the connection string from DigitalOcean dashboard
   - Add to environment variables as `REDIS_URL`

### Step 3: App Platform Deployment

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub repository
   - Select the Massachusetts Retirement System repository
   - Choose the main branch for production deployment

2. **Configure Build Settings**
   ```yaml
   # App Platform will auto-detect Next.js, but you can customize:
   name: ma-retirement-system
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/ma-retirement-system
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     routes:
     - path: /
   ```

3. **Environment Variables Configuration**
   ```bash
   # Required environment variables (set in App Platform dashboard)
   NODE_ENV=production
   NEXTAUTH_URL=https://www.masspension.com
   NEXTAUTH_SECRET=your-super-secure-secret
   DATABASE_URL=postgresql://username:password@host:port/database
   REDIS_URL=redis://username:password@host:port
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-secret
   SENTRY_DSN=your-sentry-dsn
   ```

### Step 4: Domain and SSL Configuration

1. **Configure Custom Domain**
   - Add your domain in App Platform settings
   - Update DNS records to point to App Platform
   - SSL certificates are automatically provisioned

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: @
   Value: your-app.ondigitalocean.app
   TTL: 3600

   Type: CNAME
   Name: www
   Value: your-app.ondigitalocean.app
   TTL: 3600
   ```

### Step 5: CDN and Static Assets

1. **Create Spaces Bucket**
   ```bash
   # Create bucket for static assets
   doctl spaces create ma-retirement-assets --region nyc3
   ```

2. **Configure CDN**
   - Enable CDN for the Spaces bucket
   - Update environment variables with CDN URL
   - Configure Next.js to use CDN for static assets

### Step 6: Monitoring Setup

1. **Configure Sentry**
   - Create Sentry project
   - Add Sentry DSN to environment variables
   - Configure error tracking and performance monitoring

2. **Set Up Uptime Monitoring**
   - Configure DigitalOcean monitoring for the app
   - Set up alerts for downtime and performance issues
   - Monitor database and Redis performance

### Step 7: Deployment Verification

1. **Run Health Checks**
   ```bash
   # Test application health
   curl https://your-domain.com/api/health

   # Expected response:
   {
     "status": "healthy",
     "checks": {
       "database": { "status": "healthy" },
       "memory": { "status": "healthy" },
       "performance": { "status": "healthy" }
     }
   }
   ```

2. **Performance Testing**
   ```bash
   # Test page load times
   curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/

   # Should be under 2 seconds for sub-2-second requirement
   ```

3. **Security Verification**
   ```bash
   # Check security headers
   curl -I https://your-domain.com/

   # Should include:
   # X-Frame-Options: DENY
   # X-Content-Type-Options: nosniff
   # Strict-Transport-Security: max-age=31536000
   ```

### Deployment Environments
- **Development**: Local development with SQLite
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 🚀 **Quick Start Deployment**

### Prerequisites
- Docker and Docker Compose installed
- Git repository access
- Environment variables configured
- SSL certificates (for production)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd v0-retirement
cp .env.example .env.production
# Edit .env.production with your configuration
```

### 2. Deploy to Production
```bash
# Automated deployment
npm run deploy:production

# Or manual deployment
bash scripts/deploy.sh production
```

### 3. Verify Deployment
```bash
# Run smoke tests
npm run test:smoke

# Check health
curl -f https://www.masspension.com/api/health
```

## 📋 **Environment Configuration**

### Required Environment Variables

#### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/retirement_db"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="retirement_db"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your_secure_password"
```

#### Redis Cache
```bash
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"
CACHE_PREFIX="ma-retirement"
```

#### Error Monitoring (Sentry)
```bash
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"
SENTRY_RELEASE="1.0.0"
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

#### Email Service
```bash
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"
```

#### Backup and Monitoring
```bash
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET="ma-retirement-backups"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/your/webhook/url"
```

## 🐳 **Docker Deployment**

### Build Production Image
```bash
docker build -t ma-retirement:latest .
```

### Run with Docker Compose
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Staging deployment
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Service Management
```bash
# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3

# Update services
docker-compose pull && docker-compose up -d
```

## 🗄️ **Database Migration**

### SQLite to PostgreSQL Migration
```bash
# Automated migration
npm run migrate:postgres

# Manual migration
node scripts/migrate-to-postgres.js
```

### Database Backup
```bash
# Manual backup
npm run backup:db

# Automated daily backups (configured in docker-compose)
# Backups are stored locally and uploaded to S3
```

## 🔧 **CI/CD Pipeline**

### GitHub Actions Workflow
The CI/CD pipeline automatically:
1. Runs tests and quality checks
2. Performs security scanning
3. Builds and pushes Docker images
4. Deploys to staging/production
5. Runs smoke tests
6. Sends notifications

### Manual Deployment
```bash
# Deploy to staging
git push origin develop

# Deploy to production
git tag v1.0.0
git push origin v1.0.0
```

## 📊 **Monitoring and Observability**

### Health Checks
- **Endpoint**: `/api/health`
- **Checks**: Database, Email, Memory, Disk
- **Frequency**: Every 30 seconds

### Error Monitoring
- **Sentry Integration**: Automatic error capture
- **Performance Monitoring**: API response times
- **User Session Replay**: Debug user issues

### Metrics and Logging
- **Application Logs**: Structured JSON logging
- **Performance Metrics**: Sub-2-second response times
- **Resource Monitoring**: Memory and CPU usage

## 🔒 **Security Configuration**

### SSL/TLS Setup
```bash
# Let's Encrypt certificates
certbot --nginx -d yourdomain.com

# Manual certificate installation
# Place certificates in nginx/ssl/ directory
```

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

### Rate Limiting
- API endpoints: 10 requests/second
- Authentication: 5 requests/minute
- General pages: 30 requests/second

## 🚨 **Troubleshooting**

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose config

# Test database connection
docker-compose exec app npm run health:check
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Verify credentials
docker-compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;"
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor application metrics
curl -s http://localhost:3000/api/health | jq '.checks'
```

### Rollback Procedure
```bash
# Automatic rollback (if health checks fail)
# The deployment script handles this automatically

# Manual rollback
docker-compose down
docker-compose up -d --scale app=0
# Restore from backup
# Start previous version
```

## 📈 **Performance Optimization**

### Caching Strategy
- **Redis**: Session data, API responses
- **CDN**: Static assets, images
- **Browser**: Client-side caching headers

### Database Optimization
- **Connection Pooling**: Configured in PostgreSQL
- **Query Optimization**: Indexed frequently accessed columns
- **Backup Strategy**: Daily automated backups with S3 storage

### Application Optimization
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: WebP/AVIF formats
- **Bundle Analysis**: Webpack bundle analyzer

## 🔄 **Maintenance**

### Regular Tasks
- **Daily**: Automated backups
- **Weekly**: Security updates
- **Monthly**: Performance review
- **Quarterly**: Dependency updates

### Update Procedure
1. Test updates in staging
2. Schedule maintenance window
3. Deploy with automated rollback
4. Verify functionality
5. Monitor for issues

## 📞 **Support and Contacts**

### Emergency Contacts
- **Technical Lead**: [Contact Information]
- **DevOps Team**: [Contact Information]
- **On-Call Rotation**: [Pager/Slack Channel]

### Monitoring Alerts
- **Slack**: #ma-retirement-alerts
- **Email**: alerts@yourdomain.com
- **PagerDuty**: [Integration Details]

## 📚 **Additional Resources**

- [API Documentation](./API.md)
- [Database Schema](./prisma/schema.prisma)
- [Security Guidelines](./SECURITY.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained By**: Massachusetts Retirement System Development Team
