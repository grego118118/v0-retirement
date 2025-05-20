// This is a mock implementation that doesn't use actual PostgreSQL
// It's designed to prevent build errors while maintaining the same API

export interface QueryResult {
  rows: any[]
  rowCount: number
}

// Mock query function that returns empty results
export async function query(text: string, params: any[] = []): Promise<QueryResult> {
  console.log("Mock PostgreSQL query:", { text, params })

  // Return empty result set
  return {
    rows: [],
    rowCount: 0,
  }
}

// Mock transaction function
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  console.log("Mock PostgreSQL transaction")

  // Create a mock client with a query method
  const mockClient = {
    query: async (text: string, params: any[] = []) => {
      console.log("Mock transaction query:", { text, params })
      return { rows: [], rowCount: 0 }
    },
  }

  // Execute the callback with the mock client
  return await callback(mockClient)
}

// Mock pool for direct access if needed
export function getPool() {
  return {
    connect: async () => {
      return {
        query: async (text: string, params: any[] = []) => {
          console.log("Mock pool query:", { text, params })
          return { rows: [], rowCount: 0 }
        },
        release: () => {
          console.log("Mock client released")
        },
      }
    },
    on: (event: string, callback: (err: Error) => void) => {
      // Do nothing
    },
  }
}
