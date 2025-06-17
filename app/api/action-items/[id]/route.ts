import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { ActionItemsService } from "@/lib/recommendations/action-items-service"
import { z } from "zod"
// import { reportAPIError, monitorServerOperation } from "@/sentry.server.config"

// Temporary fallback functions to avoid Sentry import issues
const reportAPIError = (error: Error, endpoint: string, method: string) => {
  console.error(`API Error [${method} ${endpoint}]:`, error)
}

const monitorServerOperation = async <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
  const startTime = Date.now()
  try {
    const result = await operation()
    const duration = Date.now() - startTime
    if (duration > 2000) {
      console.warn(`Slow operation detected: ${operationName} took ${duration}ms`)
    }
    return result
  } catch (error) {
    console.error(`Operation failed [${operationName}]:`, error)
    throw error
  }
}

// Schema for validating action item updates
const updateActionItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  category: z.enum(['profile', 'calculation', 'planning', 'optimization', 'education']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'dismissed']).optional(),
  actionType: z.enum(['navigate', 'calculate', 'review', 'contact', 'learn']).optional(),
  actionUrl: z.string().url().optional(),
  actionData: z.record(z.any()).optional(),
  displayOrder: z.number().int().min(0).optional(),
  dismissalReason: z.string().optional(),
})

// Schema for action-specific requests
const actionSchema = z.object({
  action: z.enum(['complete', 'dismiss', 'reopen']),
  reason: z.string().optional(),
  data: z.record(z.any()).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/action-items/[id]
 * Get a specific action item
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params

      const actionItem = await ActionItemsService.getActionItem(id, session.user.id)

      if (!actionItem) {
        return NextResponse.json(
          { error: "Action item not found" },
          { status: 404 }
        )
      }

      // Format response
      const formattedItem = {
        ...actionItem,
        actionData: actionItem.actionData ? JSON.parse(actionItem.actionData) : null,
      }

      return NextResponse.json({ actionItem: formattedItem })

    } catch (error) {
      console.error("Error fetching action item:", error)
      reportAPIError(error as Error, `/api/action-items/${(await params).id}`, 'GET')
      
      return NextResponse.json(
        { error: "Failed to fetch action item" },
        { status: 500 }
      )
    }
  }, 'get_action_item_api')
}

/**
 * PATCH /api/action-items/[id]
 * Update a specific action item
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params
      const body = await request.json()

      // Validate request body
      const validatedData = updateActionItemSchema.parse(body)

      // Update action item
      const actionItem = await ActionItemsService.updateActionItem(
        id,
        session.user.id,
        validatedData
      )

      if (!actionItem) {
        return NextResponse.json(
          { error: "Action item not found" },
          { status: 404 }
        )
      }

      // Format response
      const formattedItem = {
        ...actionItem,
        actionData: actionItem.actionData ? JSON.parse(actionItem.actionData) : null,
      }

      return NextResponse.json({
        actionItem: formattedItem,
        message: "Action item updated successfully",
      })

    } catch (error) {
      console.error("Error updating action item:", error)
      reportAPIError(error as Error, `/api/action-items/${(await params).id}`, 'PATCH')

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: "Invalid request data",
            details: error.errors,
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to update action item" },
        { status: 500 }
      )
    }
  }, 'update_action_item_api')
}

/**
 * POST /api/action-items/[id]
 * Perform actions on a specific action item (complete, dismiss, reopen)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params
      const body = await request.json()

      // Validate request body
      const validatedData = actionSchema.parse(body)

      let actionItem
      let message

      switch (validatedData.action) {
        case 'complete':
          actionItem = await ActionItemsService.completeActionItem(
            id,
            session.user.id,
            validatedData.data
          )
          message = "Action item marked as completed"
          break

        case 'dismiss':
          actionItem = await ActionItemsService.dismissActionItem(
            id,
            session.user.id,
            validatedData.reason
          )
          message = "Action item dismissed"
          break

        case 'reopen':
          actionItem = await ActionItemsService.updateActionItem(
            id,
            session.user.id,
            {
              status: 'pending',
              completedAt: undefined,
              dismissedAt: undefined,
              dismissalReason: undefined,
            }
          )
          message = "Action item reopened"
          break

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          )
      }

      if (!actionItem) {
        return NextResponse.json(
          { error: "Action item not found" },
          { status: 404 }
        )
      }

      // Format response
      const formattedItem = {
        ...actionItem,
        actionData: actionItem.actionData ? JSON.parse(actionItem.actionData) : null,
      }

      return NextResponse.json({
        actionItem: formattedItem,
        message,
      })

    } catch (error) {
      console.error("Error performing action on action item:", error)
      reportAPIError(error as Error, `/api/action-items/${(await params).id}`, 'POST')

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: "Invalid request data",
            details: error.errors,
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to perform action on action item" },
        { status: 500 }
      )
    }
  }, 'action_item_action_api')
}

/**
 * DELETE /api/action-items/[id]
 * Delete a specific action item
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params

      const deleted = await ActionItemsService.deleteActionItem(id, session.user.id)

      if (!deleted) {
        return NextResponse.json(
          { error: "Action item not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        message: "Action item deleted successfully",
      })

    } catch (error) {
      console.error("Error deleting action item:", error)
      reportAPIError(error as Error, `/api/action-items/${(await params).id}`, 'DELETE')
      
      return NextResponse.json(
        { error: "Failed to delete action item" },
        { status: 500 }
      )
    }
  }, 'delete_action_item_api')
}
