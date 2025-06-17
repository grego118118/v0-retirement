import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses various date input formats into a Date object
 * Handles ISO strings, Date objects, timestamps, and common date formats
 * @param dateInput - Date input in various formats
 * @returns Date object or null if invalid
 */
export function parseDate(dateInput: string | Date | number | null | undefined): Date | null {
  // Handle null, undefined, or empty values
  if (!dateInput) {
    return null
  }

  // If already a Date object, validate it
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput
  }

  // Handle timestamp numbers
  if (typeof dateInput === 'number') {
    const date = new Date(dateInput)
    return isNaN(date.getTime()) ? null : date
  }

  // Handle string inputs
  if (typeof dateInput === 'string') {
    // Try parsing as ISO string or common formats
    const date = new Date(dateInput)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * Formats a date for display with proper error handling
 * Accepts various date input formats and provides fallback for invalid dates
 * @param dateInput - Date input in various formats (Date object, ISO string, timestamp)
 * @returns Formatted date string or fallback text
 */
export function formatDate(dateInput: string | Date | number | null | undefined): string {
  // Parse the input into a Date object
  const date = parseDate(dateInput)

  // Return fallback if parsing failed
  if (!date) {
    return 'Invalid Date'
  }

  try {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export function formatCurrency(amount: number | undefined | null): string {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
