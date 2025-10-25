#!/bin/bash

# Massachusetts Retirement System - Database Backup Script
# Automated PostgreSQL backup with S3 upload and retention management

set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="ma_retirement_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
COMPRESSED_PATH="${BACKUP_DIR}/${COMPRESSED_FILE}"

# Database configuration
DB_HOST="${POSTGRES_HOST:-postgres}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB}"
DB_USER="${POSTGRES_USER}"
DB_PASSWORD="${POSTGRES_PASSWORD}"

# S3 configuration
S3_BUCKET="${AWS_S3_BUCKET}"
S3_PREFIX="database-backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Logging
LOG_FILE="${BACKUP_DIR}/backup.log"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "${LOG_FILE}" >&2
}

cleanup() {
    if [[ -f "${BACKUP_PATH}" ]]; then
        rm -f "${BACKUP_PATH}"
        log "Cleaned up temporary backup file"
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Main backup function
perform_backup() {
    log "Starting database backup for ${DB_NAME}"
    
    # Create backup directory if it doesn't exist
    mkdir -p "${BACKUP_DIR}"
    
    # Set PostgreSQL password
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Create database dump
    log "Creating database dump..."
    if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
        --verbose --clean --no-owner --no-privileges \
        --format=plain > "${BACKUP_PATH}"; then
        log "Database dump created successfully: ${BACKUP_PATH}"
    else
        error "Failed to create database dump"
        return 1
    fi
    
    # Get backup size
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    log "Backup size: ${BACKUP_SIZE}"
    
    # Compress backup
    log "Compressing backup..."
    if gzip "${BACKUP_PATH}"; then
        log "Backup compressed successfully: ${COMPRESSED_PATH}"
    else
        error "Failed to compress backup"
        return 1
    fi
    
    # Get compressed size
    COMPRESSED_SIZE=$(du -h "${COMPRESSED_PATH}" | cut -f1)
    log "Compressed size: ${COMPRESSED_SIZE}"
    
    return 0
}

# Upload to S3
upload_to_s3() {
    if [[ -z "${S3_BUCKET}" ]]; then
        log "S3 bucket not configured, skipping upload"
        return 0
    fi
    
    log "Uploading backup to S3..."
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        error "AWS CLI not found, cannot upload to S3"
        return 1
    fi
    
    # Upload file
    S3_KEY="${S3_PREFIX}/${COMPRESSED_FILE}"
    if aws s3 cp "${COMPRESSED_PATH}" "s3://${S3_BUCKET}/${S3_KEY}" \
        --storage-class STANDARD_IA \
        --metadata "database=${DB_NAME},timestamp=${TIMESTAMP}"; then
        log "Backup uploaded to S3: s3://${S3_BUCKET}/${S3_KEY}"
    else
        error "Failed to upload backup to S3"
        return 1
    fi
    
    return 0
}

# Clean up old local backups
cleanup_local_backups() {
    log "Cleaning up local backups older than ${RETENTION_DAYS} days..."
    
    find "${BACKUP_DIR}" -name "ma_retirement_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    local deleted_count=$(find "${BACKUP_DIR}" -name "ma_retirement_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)
    log "Deleted ${deleted_count} old local backup files"
}

# Clean up old S3 backups
cleanup_s3_backups() {
    if [[ -z "${S3_BUCKET}" ]]; then
        return 0
    fi
    
    log "Cleaning up S3 backups older than ${RETENTION_DAYS} days..."
    
    # Calculate cutoff date
    CUTOFF_DATE=$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)
    
    # List and delete old backups
    aws s3api list-objects-v2 \
        --bucket "${S3_BUCKET}" \
        --prefix "${S3_PREFIX}/" \
        --query "Contents[?LastModified<='${CUTOFF_DATE}'].Key" \
        --output text | while read -r key; do
        if [[ -n "${key}" && "${key}" != "None" ]]; then
            aws s3 rm "s3://${S3_BUCKET}/${key}"
            log "Deleted old S3 backup: ${key}"
        fi
    done
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    # Test if the compressed file can be decompressed
    if gzip -t "${COMPRESSED_PATH}"; then
        log "Backup compression integrity verified"
    else
        error "Backup compression integrity check failed"
        return 1
    fi
    
    # Test if the SQL file is valid (basic check)
    if zcat "${COMPRESSED_PATH}" | head -n 10 | grep -q "PostgreSQL database dump"; then
        log "Backup content integrity verified"
    else
        error "Backup content integrity check failed"
        return 1
    fi
    
    return 0
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Slack notification (if webhook URL is configured)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        local emoji="✅"
        
        if [[ "${status}" != "success" ]]; then
            color="danger"
            emoji="❌"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"${emoji} Database Backup ${status}: ${message}\"}" \
            "${SLACK_WEBHOOK_URL}" || true
    fi
    
    # Email notification (if configured)
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]] && command -v mail &> /dev/null; then
        echo "${message}" | mail -s "MA Retirement DB Backup ${status}" "${NOTIFICATION_EMAIL}" || true
    fi
}

# Health check
health_check() {
    log "Performing database health check..."
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Test database connection
    if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"; then
        log "Database connection healthy"
    else
        error "Database connection failed"
        return 1
    fi
    
    # Test basic query
    if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
        -c "SELECT COUNT(*) FROM \"User\";" > /dev/null 2>&1; then
        log "Database query test successful"
    else
        error "Database query test failed"
        return 1
    fi
    
    return 0
}

# Main execution
main() {
    log "=== Starting backup process ==="
    
    # Perform health check
    if ! health_check; then
        send_notification "failed" "Database health check failed"
        exit 1
    fi
    
    # Perform backup
    if ! perform_backup; then
        send_notification "failed" "Database backup creation failed"
        exit 1
    fi
    
    # Verify backup
    if ! verify_backup; then
        send_notification "failed" "Backup verification failed"
        exit 1
    fi
    
    # Upload to S3
    if ! upload_to_s3; then
        send_notification "failed" "S3 upload failed"
        exit 1
    fi
    
    # Cleanup old backups
    cleanup_local_backups
    cleanup_s3_backups
    
    # Success notification
    FINAL_SIZE=$(du -h "${COMPRESSED_PATH}" | cut -f1)
    send_notification "success" "Backup completed successfully (${FINAL_SIZE})"
    
    log "=== Backup process completed successfully ==="
}

# Execute main function
main "$@"
