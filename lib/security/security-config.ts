/**
 * Massachusetts Retirement System - Security Configuration
 * 
 * Enhanced security measures for government/financial application compliance.
 * Implements security headers, input validation, and compliance requirements.
 */

import { NextRequest, NextResponse } from 'next/server'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

// Security configuration constants
export const SECURITY_CONFIG = {
  // Rate limiting configuration
  rateLimits: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit auth attempts
      message: 'Too many authentication attempts, please try again later.'
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // Limit API calls
      message: 'API rate limit exceeded, please try again later.'
    },
    calculations: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20, // Limit calculation requests
      message: 'Too many calculation requests, please try again later.'
    }
  },
  
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for development
      'https://vercel.live',
      'https://va.vercel-scripts.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https://lh3.googleusercontent.com', // Google OAuth avatars
      'https://avatars.githubusercontent.com' // GitHub OAuth avatars
    ],
    'connect-src': [
      "'self'",
      'https://api.github.com',
      'https://accounts.google.com',
      'https://oauth2.googleapis.com',
      process.env.SENTRY_DSN ? new URL(process.env.SENTRY_DSN).origin : ''
    ].filter(Boolean),
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': []
  },
  
  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
}

/**
 * Generate Content Security Policy header value
 */
export function generateCSPHeader(): string {
  const csp = SECURITY_CONFIG.csp
  
  return Object.entries(csp)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(' ')}`
      }
      return directive
    })
    .join('; ')
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply all security headers
  Object.entries(SECURITY_CONFIG.headers).forEach(([header, value]) => {
    response.headers.set(header, value)
  })
  
  // Apply Content Security Policy
  const cspHeader = generateCSPHeader()
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
  
  return response
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 1000) // Limit length
  }
  
  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any, min?: number, max?: number): number {
    const num = parseFloat(input)
    if (isNaN(num)) return 0
    
    let sanitized = num
    if (min !== undefined) sanitized = Math.max(min, sanitized)
    if (max !== undefined) sanitized = Math.min(max, sanitized)
    
    return sanitized
  }
  
  /**
   * Sanitize email input
   */
  static sanitizeEmail(input: string): string {
    if (typeof input !== 'string') return ''
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const sanitized = input.toLowerCase().trim()
    
    return emailRegex.test(sanitized) ? sanitized : ''
  }
  
  /**
   * Sanitize date input
   */
  static sanitizeDate(input: string): string {
    if (typeof input !== 'string') return ''
    
    const date = new Date(input)
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
  }
  
  /**
   * Sanitize retirement group input
   */
  static sanitizeRetirementGroup(input: string): string {
    const validGroups = ['GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4']
    return validGroups.includes(input) ? input : 'GROUP_1'
  }
  
  /**
   * Sanitize retirement option input
   */
  static sanitizeRetirementOption(input: string): string {
    const validOptions = ['A', 'B', 'C']
    return validOptions.includes(input) ? input : 'A'
  }
}

/**
 * Request validation middleware
 */
export function validateRequest(req: NextRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check for required headers
  const userAgent = req.headers.get('user-agent')
  if (!userAgent || userAgent.length < 10) {
    errors.push('Invalid or missing User-Agent header')
  }
  
  // Check for suspicious patterns
  const url = req.url.toLowerCase()
  const suspiciousPatterns = [
    'script',
    'javascript:',
    '<script',
    'eval(',
    'expression(',
    'vbscript:',
    'onload=',
    'onerror='
  ]
  
  if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
    errors.push('Suspicious URL pattern detected')
  }
  
  // Check request size (prevent large payloads)
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    errors.push('Request payload too large')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * API route security wrapper
 */
export function withSecurity<T extends (...args: any[]) => any>(handler: T): T {
  return (async (req: NextRequest, ...args: any[]) => {
    // Validate request
    const validation = validateRequest(req)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      )
    }
    
    // Apply rate limiting based on endpoint
    const pathname = new URL(req.url).pathname
    
    // Determine rate limit type
    let rateLimitType: keyof typeof SECURITY_CONFIG.rateLimits = 'general'
    if (pathname.includes('/auth/')) rateLimitType = 'auth'
    else if (pathname.includes('/api/')) rateLimitType = 'api'
    else if (pathname.includes('/calculate')) rateLimitType = 'calculations'
    
    // Note: In production, implement proper rate limiting with Redis
    // This is a simplified version for demonstration
    
    try {
      const response = await handler(req, ...args)
      
      // Apply security headers to API responses
      if (response instanceof NextResponse) {
        return applySecurityHeaders(response)
      }
      
      return response
    } catch (error) {
      // Log security-related errors
      console.error('Security wrapper error:', {
        pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }) as T
}

/**
 * Environment variable validation
 */
export function validateEnvironmentVariables(): { isValid: boolean; missing: string[] } {
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ]
  
  const production = [
    'DATABASE_URL',
    'REDIS_URL',
    'SENTRY_DSN'
  ]
  
  const missing: string[] = []
  
  // Check required variables
  required.forEach(variable => {
    if (!process.env[variable]) {
      missing.push(variable)
    }
  })
  
  // Check production variables in production
  if (process.env.NODE_ENV === 'production') {
    production.forEach(variable => {
      if (!process.env[variable]) {
        missing.push(variable)
      }
    })
  }
  
  return {
    isValid: missing.length === 0,
    missing
  }
}

/**
 * Security audit logging
 */
export function logSecurityEvent(event: {
  type: 'auth_attempt' | 'rate_limit' | 'suspicious_request' | 'validation_error'
  ip?: string
  userAgent?: string
  details?: any
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: event.type,
    ip: event.ip || 'unknown',
    userAgent: event.userAgent || 'unknown',
    details: event.details || {},
    environment: process.env.NODE_ENV
  }
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry or security monitoring service
    console.warn('Security Event:', logEntry)
  } else {
    console.log('Security Event:', logEntry)
  }
}

/**
 * Data encryption utilities for sensitive information
 */
export class DataEncryption {
  private static readonly algorithm = 'aes-256-gcm'
  
  /**
   * Encrypt sensitive data (placeholder - implement with proper crypto library)
   */
  static encrypt(data: string, key: string): string {
    // In production, use proper encryption library like crypto-js
    // This is a placeholder implementation
    return Buffer.from(data).toString('base64')
  }
  
  /**
   * Decrypt sensitive data (placeholder - implement with proper crypto library)
   */
  static decrypt(encryptedData: string, key: string): string {
    // In production, use proper decryption
    // This is a placeholder implementation
    return Buffer.from(encryptedData, 'base64').toString('utf-8')
  }
  
  /**
   * Hash sensitive data for storage
   */
  static hash(data: string): string {
    // In production, use bcrypt or similar
    // This is a placeholder implementation
    return Buffer.from(data).toString('base64')
  }
}

/**
 * Compliance utilities for government/financial requirements
 */
export class ComplianceUtils {
  /**
   * Validate data retention requirements
   */
  static validateDataRetention(createdAt: Date): boolean {
    const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000 // 7 years in milliseconds
    const now = new Date().getTime()
    const created = createdAt.getTime()
    
    return (now - created) < retentionPeriod
  }
  
  /**
   * Anonymize user data for compliance
   */
  static anonymizeUserData(data: any): any {
    const anonymized = { ...data }
    
    // Remove or hash personally identifiable information
    if (anonymized.email) anonymized.email = DataEncryption.hash(anonymized.email)
    if (anonymized.fullName) anonymized.fullName = 'ANONYMIZED'
    if (anonymized.dateOfBirth) anonymized.dateOfBirth = null
    
    return anonymized
  }
  
  /**
   * Generate audit trail entry
   */
  static createAuditEntry(action: string, userId: string, details: any) {
    return {
      timestamp: new Date().toISOString(),
      action,
      userId: DataEncryption.hash(userId),
      details: ComplianceUtils.anonymizeUserData(details),
      environment: process.env.NODE_ENV
    }
  }
}
