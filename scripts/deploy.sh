#!/bin/bash

# Massachusetts Retirement System - Production Deployment Script
# Automated deployment with health checks and rollback capabilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${1:-production}"
FORCE_DEPLOY="${2:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    # Add any cleanup logic here
}

# Trap cleanup on exit
trap cleanup EXIT

# Validate environment
validate_environment() {
    log "Validating deployment environment: ${DEPLOYMENT_ENV}"
    
    case "${DEPLOYMENT_ENV}" in
        "staging"|"production")
            log "Environment validated: ${DEPLOYMENT_ENV}"
            ;;
        *)
            error "Invalid environment: ${DEPLOYMENT_ENV}. Must be 'staging' or 'production'"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if required environment files exist
    local env_file=".env.${DEPLOYMENT_ENV}"
    if [[ ! -f "${PROJECT_ROOT}/${env_file}" ]]; then
        error "Environment file not found: ${env_file}"
        exit 1
    fi
    
    # Check if we're in a git repository
    if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
        error "Not in a git repository"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check git status
    if [[ -n "$(git status --porcelain)" ]] && [[ "${FORCE_DEPLOY}" != "true" ]]; then
        error "Working directory is not clean. Commit or stash changes, or use --force"
        git status --short
        exit 1
    fi
    
    # Check if we're on the correct branch
    local current_branch=$(git branch --show-current)
    local expected_branch
    
    case "${DEPLOYMENT_ENV}" in
        "staging")
            expected_branch="develop"
            ;;
        "production")
            expected_branch="main"
            ;;
    esac
    
    if [[ "${current_branch}" != "${expected_branch}" ]] && [[ "${FORCE_DEPLOY}" != "true" ]]; then
        error "Not on expected branch. Current: ${current_branch}, Expected: ${expected_branch}"
        exit 1
    fi
    
    # Run tests
    log "Running tests..."
    cd "${PROJECT_ROOT}"
    
    if ! npm test -- --watchAll=false --coverage=false; then
        error "Tests failed"
        exit 1
    fi
    
    # Run linting
    log "Running linting..."
    if ! npm run lint; then
        error "Linting failed"
        exit 1
    fi
    
    # Run type checking
    log "Running type checking..."
    if ! npm run type-check; then
        error "Type checking failed"
        exit 1
    fi
    
    success "Pre-deployment checks passed"
}

# Build application
build_application() {
    log "Building application for ${DEPLOYMENT_ENV}..."
    
    cd "${PROJECT_ROOT}"
    
    # Set environment variables for build
    export NODE_ENV="production"
    export NEXT_TELEMETRY_DISABLED=1
    
    # Build Docker image
    local image_tag="ma-retirement:${DEPLOYMENT_ENV}-$(git rev-parse --short HEAD)"
    
    log "Building Docker image: ${image_tag}"
    
    if ! docker build \
        --target runner \
        --build-arg NODE_ENV=production \
        --build-arg BUILDTIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --build-arg VERSION="$(git describe --tags --always)" \
        --build-arg REVISION="$(git rev-parse HEAD)" \
        -t "${image_tag}" \
        -t "ma-retirement:${DEPLOYMENT_ENV}-latest" \
        .; then
        error "Docker build failed"
        exit 1
    fi
    
    success "Application built successfully: ${image_tag}"
    echo "${image_tag}" > ".last-build-${DEPLOYMENT_ENV}"
}

# Database migration
run_database_migration() {
    log "Running database migration..."
    
    cd "${PROJECT_ROOT}"
    
    # Load environment variables
    set -a
    source ".env.${DEPLOYMENT_ENV}"
    set +a
    
    # Run migration script
    if [[ -f "scripts/migrate-to-postgres.js" ]]; then
        log "Running PostgreSQL migration..."
        if ! node scripts/migrate-to-postgres.js; then
            error "Database migration failed"
            exit 1
        fi
    else
        # Run Prisma migrations
        log "Running Prisma migrations..."
        if ! npx prisma migrate deploy; then
            error "Prisma migration failed"
            exit 1
        fi
    fi
    
    success "Database migration completed"
}

# Deploy application
deploy_application() {
    log "Deploying application to ${DEPLOYMENT_ENV}..."
    
    cd "${PROJECT_ROOT}"
    
    # Create backup of current deployment
    if docker-compose -f docker-compose.yml -f "docker-compose.${DEPLOYMENT_ENV}.yml" ps | grep -q "Up"; then
        log "Creating backup of current deployment..."
        
        # Backup database
        docker-compose -f docker-compose.yml -f "docker-compose.${DEPLOYMENT_ENV}.yml" \
            exec -T postgres pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" \
            > "backup-pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
        
        success "Backup created"
    fi
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f docker-compose.yml -f "docker-compose.${DEPLOYMENT_ENV}.yml" pull
    
    # Deploy with rolling update
    log "Starting rolling deployment..."
    
    # Update application containers
    docker-compose -f docker-compose.yml -f "docker-compose.${DEPLOYMENT_ENV}.yml" \
        up -d --no-deps app
    
    # Wait for health check
    log "Waiting for application health check..."
    sleep 30
    
    # Check if application is healthy
    if ! check_application_health; then
        error "Application health check failed"
        rollback_deployment
        exit 1
    fi
    
    # Update other services
    docker-compose -f docker-compose.yml -f "docker-compose.${DEPLOYMENT_ENV}.yml" up -d
    
    # Cleanup old images
    log "Cleaning up old Docker images..."
    docker image prune -f
    
    success "Deployment completed successfully"
}

# Health check
check_application_health() {
    log "Performing application health check..."
    
    local health_url="${HEALTH_CHECK_URL:-http://localhost:3000/api/health}"
    local max_attempts=30
    local attempt=1
    
    while [[ ${attempt} -le ${max_attempts} ]]; do
        log "Health check attempt ${attempt}/${max_attempts}..."
        
        if curl -f -s "${health_url}" > /dev/null; then
            success "Application is healthy"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Application health check failed after ${max_attempts} attempts"
    return 1
}

# Rollback deployment
rollback_deployment() {
    warn "Rolling back deployment..."
    
    cd "${PROJECT_ROOT}"
    
    # Get previous image tag
    local previous_image
    if [[ -f ".last-build-${DEPLOYMENT_ENV}" ]]; then
        previous_image=$(cat ".last-build-${DEPLOYMENT_ENV}")
    else
        previous_image="ma-retirement:${DEPLOYMENT_ENV}-latest"
    fi
    
    log "Rolling back to: ${previous_image}"
    
    # Rollback application
    docker-compose -f docker-compose.yml -f "docker-compose.${DEPLOYMENT_ENV}.yml" \
        stop app
    
    # Start with previous image
    docker run -d --name "ma-retirement-rollback" "${previous_image}"
    
    warn "Rollback completed. Please investigate the deployment issue."
}

# Post-deployment tasks
post_deployment_tasks() {
    log "Running post-deployment tasks..."
    
    # Run smoke tests
    log "Running smoke tests..."
    if [[ -f "scripts/smoke-tests.sh" ]]; then
        if ! bash "scripts/smoke-tests.sh" "${DEPLOYMENT_ENV}"; then
            warn "Smoke tests failed"
        else
            success "Smoke tests passed"
        fi
    fi
    
    # Send deployment notification
    send_deployment_notification "success"
    
    success "Post-deployment tasks completed"
}

# Send deployment notification
send_deployment_notification() {
    local status="$1"
    local emoji="✅"
    local color="good"
    
    if [[ "${status}" != "success" ]]; then
        emoji="❌"
        color="danger"
    fi
    
    local message="${emoji} Deployment to ${DEPLOYMENT_ENV} ${status}"
    local git_commit=$(git rev-parse --short HEAD)
    local git_author=$(git log -1 --pretty=format:'%an')
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\": \"${message}\",
                \"attachments\": [{
                    \"color\": \"${color}\",
                    \"fields\": [
                        {\"title\": \"Environment\", \"value\": \"${DEPLOYMENT_ENV}\", \"short\": true},
                        {\"title\": \"Commit\", \"value\": \"${git_commit}\", \"short\": true},
                        {\"title\": \"Author\", \"value\": \"${git_author}\", \"short\": true}
                    ]
                }]
            }" \
            "${SLACK_WEBHOOK_URL}" || true
    fi
    
    log "Deployment notification sent"
}

# Main deployment function
main() {
    log "Starting deployment to ${DEPLOYMENT_ENV}..."
    
    validate_environment
    check_prerequisites
    pre_deployment_checks
    build_application
    run_database_migration
    deploy_application
    post_deployment_tasks
    
    success "Deployment to ${DEPLOYMENT_ENV} completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "staging"|"production")
        main
        ;;
    "--help"|"-h")
        echo "Usage: $0 <environment> [force]"
        echo "  environment: staging or production"
        echo "  force: skip git checks (optional)"
        exit 0
        ;;
    *)
        error "Invalid usage. Use --help for usage information."
        exit 1
        ;;
esac
