interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface ApiError extends Error {
  status?: number;
  statusText?: string;
  endpoint?: string;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// Error classification for retry logic
const isRetryableError = (error: any): boolean => {
  // Network errors (TypeError for fetch failures)
  if (error instanceof TypeError) return true;
  
  // Server errors (5xx)
  if (error.status >= 500) return true;
  
  // Specific database connection errors
  if (error.message?.includes('Connection timeout')) return true;
  if (error.message?.includes('database')) return true;
  if (error.message?.includes('prisma')) return true;
  
  return false;
};

// Enhanced fetch with retry logic and error handling
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...defaultRetryConfig, ...retryConfig };
  let lastError: ApiError;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.ok) {
        return await response.json();
      }

      // Create structured error
      const apiError: ApiError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      apiError.status = response.status;
      apiError.statusText = response.statusText;
      apiError.endpoint = url;

      // Handle specific error codes
      if (response.status >= 500 && attempt < config.maxAttempts) {
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );
        
        console.warn(`API request failed (${response.status}), retrying in ${delay}ms... (attempt ${attempt}/${config.maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw apiError;
    } catch (error) {
      lastError = error as ApiError;
      lastError.endpoint = url;
      
      if (attempt === config.maxAttempts) {
        console.error(`API request failed after ${config.maxAttempts} attempts:`, lastError);
        throw lastError;
      }

      // Only retry on retryable errors
      if (isRetryableError(error)) {
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );
        
        console.warn(`Retryable error detected, retrying in ${delay}ms... (attempt ${attempt}/${config.maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError!;
}

// Specialized API client methods
export const apiClient = {
  // Profile API with enhanced error handling
  async fetchProfile(userId: string): Promise<any> {
    return fetchWithRetry(`/api/profile?userId=${userId}`, {
      method: 'GET',
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
    });
  },

  // Calculations API with enhanced error handling
  async fetchCalculations(userId: string, limit: number = 20): Promise<any> {
    return fetchWithRetry(`/api/retirement/calculations?limit=${limit}`, {
      method: 'GET',
    }, {
      maxAttempts: 3,
      baseDelay: 1000,
    });
  },

  // Subscription status API
  async fetchSubscriptionStatus(userId: string): Promise<any> {
    return fetchWithRetry(`/api/subscription/status?userId=${userId}`, {
      method: 'GET',
    }, {
      maxAttempts: 2,
      baseDelay: 500,
    });
  },

  // Generic POST request with retry
  async post<T>(url: string, data: any): Promise<T> {
    return fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Generic PUT request with retry
  async put<T>(url: string, data: any): Promise<T> {
    return fetchWithRetry(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Generic DELETE request with retry
  async delete<T>(url: string): Promise<T> {
    return fetchWithRetry(url, {
      method: 'DELETE',
    });
  },
};

export default apiClient;
