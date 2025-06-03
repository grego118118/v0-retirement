# Massachusetts Retirement System - Production Deployment Guide

This guide covers the complete production deployment infrastructure for the Massachusetts Retirement System website.

## 🏗️ **Infrastructure Overview**

### Architecture Components
- **Application**: Next.js 15 with TypeScript
- **Database**: PostgreSQL 15 with connection pooling
- **Cache**: Redis for session and data caching
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Sentry for error tracking and performance
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for service management

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
curl -f https://yourdomain.com/api/health
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
