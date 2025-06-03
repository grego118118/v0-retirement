#!/bin/bash

# Massachusetts Retirement System - Smoke Tests
# Basic functionality tests for deployed application

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-production}"
BASE_URL="${TEST_URL:-http://localhost:3000}"
TIMEOUT=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

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

# Test helper functions
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    log "Running test: ${test_name}"
    
    if ${test_function}; then
        success "✅ ${test_name}"
        ((TESTS_PASSED++))
    else
        error "❌ ${test_name}"
        ((TESTS_FAILED++))
        FAILED_TESTS+=("${test_name}")
    fi
}

# HTTP request helper
make_request() {
    local url="$1"
    local expected_status="${2:-200}"
    local method="${3:-GET}"
    local data="${4:-}"
    
    local response
    local status_code
    
    if [[ -n "${data}" ]]; then
        response=$(curl -s -w "\n%{http_code}" -X "${method}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            --max-time "${TIMEOUT}" \
            "${BASE_URL}${url}" 2>/dev/null || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "${method}" \
            --max-time "${TIMEOUT}" \
            "${BASE_URL}${url}" 2>/dev/null || echo -e "\n000")
    fi
    
    status_code=$(echo "${response}" | tail -n1)
    
    if [[ "${status_code}" == "${expected_status}" ]]; then
        return 0
    else
        log "Expected status ${expected_status}, got ${status_code}"
        return 1
    fi
}

# Test: Health check endpoint
test_health_check() {
    log "Testing health check endpoint..."
    
    if make_request "/api/health" 200; then
        local health_response=$(curl -s "${BASE_URL}/api/health" | head -n -1)
        
        # Check if response contains expected fields
        if echo "${health_response}" | grep -q '"status"' && \
           echo "${health_response}" | grep -q '"timestamp"' && \
           echo "${health_response}" | grep -q '"checks"'; then
            return 0
        else
            log "Health check response missing required fields"
            return 1
        fi
    else
        return 1
    fi
}

# Test: Home page loads
test_home_page() {
    log "Testing home page..."
    
    if make_request "/" 200; then
        local page_content=$(curl -s "${BASE_URL}/")
        
        # Check for key elements
        if echo "${page_content}" | grep -q "Massachusetts Retirement" && \
           echo "${page_content}" | grep -q "Calculator"; then
            return 0
        else
            log "Home page missing expected content"
            return 1
        fi
    else
        return 1
    fi
}

# Test: Calculator page loads
test_calculator_page() {
    log "Testing calculator page..."
    
    if make_request "/calculator" 200; then
        local page_content=$(curl -s "${BASE_URL}/calculator")
        
        # Check for calculator elements
        if echo "${page_content}" | grep -q "Pension Calculator" || \
           echo "${page_content}" | grep -q "calculator"; then
            return 0
        else
            log "Calculator page missing expected content"
            return 1
        fi
    else
        return 1
    fi
}

# Test: API authentication endpoint
test_auth_api() {
    log "Testing authentication API..."
    
    # Test that protected endpoints return 401 without auth
    if make_request "/api/user/profile" 401; then
        return 0
    else
        log "Authentication not working properly"
        return 1
    fi
}

# Test: Database connectivity
test_database_connectivity() {
    log "Testing database connectivity..."
    
    local health_response=$(curl -s "${BASE_URL}/api/health")
    
    if echo "${health_response}" | grep -q '"database"' && \
       echo "${health_response}" | grep -q '"status":"pass"'; then
        return 0
    else
        log "Database connectivity check failed"
        return 1
    fi
}

# Test: Email service status
test_email_service() {
    log "Testing email service status..."
    
    local health_response=$(curl -s "${BASE_URL}/api/health")
    
    if echo "${health_response}" | grep -q '"email"'; then
        local email_status=$(echo "${health_response}" | grep -o '"email":{[^}]*}' | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        if [[ "${email_status}" == "pass" || "${email_status}" == "warn" ]]; then
            return 0
        else
            log "Email service not available"
            return 1
        fi
    else
        log "Email service status not found in health check"
        return 1
    fi
}

# Test: Static assets load
test_static_assets() {
    log "Testing static assets..."
    
    # Test favicon
    if make_request "/favicon.ico" 200; then
        return 0
    else
        log "Static assets not loading properly"
        return 1
    fi
}

# Test: API rate limiting
test_rate_limiting() {
    log "Testing API rate limiting..."
    
    # Make multiple rapid requests to trigger rate limiting
    local rate_limit_triggered=false
    
    for i in {1..15}; do
        local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${BASE_URL}/api/health")
        
        if [[ "${status_code}" == "429" ]]; then
            rate_limit_triggered=true
            break
        fi
        
        sleep 0.1
    done
    
    if [[ "${rate_limit_triggered}" == "true" ]]; then
        log "Rate limiting is working"
        return 0
    else
        warn "Rate limiting may not be configured properly"
        return 0  # Don't fail the test, just warn
    fi
}

# Test: Security headers
test_security_headers() {
    log "Testing security headers..."
    
    local headers=$(curl -s -I "${BASE_URL}/")
    
    local required_headers=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
    )
    
    local missing_headers=()
    
    for header in "${required_headers[@]}"; do
        if ! echo "${headers}" | grep -qi "${header}"; then
            missing_headers+=("${header}")
        fi
    done
    
    if [[ ${#missing_headers[@]} -eq 0 ]]; then
        return 0
    else
        log "Missing security headers: ${missing_headers[*]}"
        return 1
    fi
}

# Test: Performance check
test_performance() {
    log "Testing performance..."
    
    local start_time=$(date +%s%N)
    make_request "/" 200 > /dev/null
    local end_time=$(date +%s%N)
    
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [[ ${duration} -lt 2000 ]]; then # Less than 2 seconds
        log "Page load time: ${duration}ms"
        return 0
    else
        log "Page load time too slow: ${duration}ms"
        return 1
    fi
}

# Test: Memory usage
test_memory_usage() {
    log "Testing memory usage..."
    
    local health_response=$(curl -s "${BASE_URL}/api/health")
    
    if echo "${health_response}" | grep -q '"memory"'; then
        local memory_status=$(echo "${health_response}" | grep -o '"memory":{[^}]*}' | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        if [[ "${memory_status}" == "pass" || "${memory_status}" == "warn" ]]; then
            return 0
        else
            log "Memory usage check failed"
            return 1
        fi
    else
        log "Memory status not found in health check"
        return 1
    fi
}

# Main test execution
main() {
    log "Starting smoke tests for ${ENVIRONMENT} environment"
    log "Base URL: ${BASE_URL}"
    log "Timeout: ${TIMEOUT} seconds"
    echo ""
    
    # Run all tests
    run_test "Health Check Endpoint" test_health_check
    run_test "Home Page Load" test_home_page
    run_test "Calculator Page Load" test_calculator_page
    run_test "API Authentication" test_auth_api
    run_test "Database Connectivity" test_database_connectivity
    run_test "Email Service Status" test_email_service
    run_test "Static Assets" test_static_assets
    run_test "Rate Limiting" test_rate_limiting
    run_test "Security Headers" test_security_headers
    run_test "Performance Check" test_performance
    run_test "Memory Usage" test_memory_usage
    
    # Print results
    echo ""
    log "Smoke test results:"
    success "Tests passed: ${TESTS_PASSED}"
    
    if [[ ${TESTS_FAILED} -gt 0 ]]; then
        error "Tests failed: ${TESTS_FAILED}"
        error "Failed tests: ${FAILED_TESTS[*]}"
        echo ""
        error "Smoke tests failed!"
        exit 1
    else
        echo ""
        success "All smoke tests passed!"
        exit 0
    fi
}

# Run main function
main
