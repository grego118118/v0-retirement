import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number | null | undefined): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return 'N/A'
  }

  let dateObj: Date

  try {
    // If it's already a Date object
    if (date instanceof Date) {
      dateObj = date
    }
    // If it's a string or number, try to create a Date object
    else {
      dateObj = new Date(date)
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    // Fallback for any parsing errors
    return 'Invalid Date'
  }
}

export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Helper function to safely parse dates
export function parseDate(date: Date | string | number | null | undefined): Date | null {
  if (!date) {
    return null
  }

  try {
    let dateObj: Date

    if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date(date)
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return null
    }

    return dateObj
  } catch (error) {
    return null
  }
}

// Helper function to calculate years between dates
export function calculateYearsBetween(startDate: Date | string | null | undefined, endDate: Date | string | null | undefined = new Date()): number {
  const start = parseDate(startDate)
  const end = parseDate(endDate)

  if (!start || !end) {
    return 0
  }

  const diffTime = end.getTime() - start.getTime()
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25) // Use 365.25 to account for leap years
  return Math.round(diffYears * 10) / 10 // Round to 1 decimal place
}
