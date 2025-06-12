import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { ActionItemsService } from "@/lib/recommendations/action-items-service"
import { z } from "zod"
import { reportAPIError, monitorServerOperation } from "@/sentry.server.config"

// Schema for validating action item creation
const createActionItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.enum(['profile', 'calculation', 'planning', 'optimization', 'education']),
  priority: z.enum(['high', 'medium', 'low']),
  actionType: z.enum(['navigate', 'calculate', 'review', 'contact', 'learn']),
  actionUrl: z.string().url().optional(),
  actionData: z.record(z.any()).optional(),
  triggerCondition: z.string().optional(),
  targetGroup: z.string().optional(),
  targetAgeRange: z.string().optional(),
  targetServiceRange: z.string().optional(),
  relatedCalculationId: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  isSystemGenerated: z.boolean().optional(),
  generationReason: z.string().optional(),
})

// Schema for filtering action items
const filterSchema = z.object({
  status: z.union([z.string(), z.array(z.string())]).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  priority: z.union([z.string(), z.array(z.string())]).optional(),
  isExpired: z.boolean().optional(),
  includeCompleted: z.boolean().optional(),
  includeDismissed: z.boolean().optional(),
})

/**
 * GET /api/action-items
 * Get action items for the authenticated user
 */
export async function GET(request: NextRequest) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url)
      const filters: any = {}

      // Parse filters from query parameters
      if (searchParams.get('status')) {
        const status = searchParams.get('status')!
        filters.status = status.includes(',') ? status.split(',') : status
      }

      if (searchParams.get('category')) {
        const category = searchParams.get('category')!
        filters.category = category.includes(',') ? category.split(',') : category
      }

      if (searchParams.get('priority')) {
        const priority = searchParams.get('priority')!
        filters.priority = priority.includes(',') ? priority.split(',') : priority
      }

      if (searchParams.get('isExpired')) {
        filters.isExpired = searchParams.get('isExpired') === 'true'
      }

      if (searchParams.get('includeCompleted')) {
        filters.includeCompleted = searchParams.get('includeCompleted') === 'true'
      }

      if (searchParams.get('includeDismissed')) {
        filters.includeDismissed = searchParams.get('includeDismissed') === 'true'
      }

      // Validate filters
      const validatedFilters = filterSchema.parse(filters)

      // Get action items
      const actionItems = await ActionItemsService.getUserActionItems(
        session.user.id,
        validatedFilters
      )

      // Parse JSON fields for response
      const formattedItems = actionItems.map(item => ({
        ...item,
        actionData: item.actionData ? JSON.parse(item.actionData) : null,
      }))

      return NextResponse.json({
        actionItems: formattedItems,
        count: formattedItems.length,
      })

    } catch (error) {
      console.error("Error fetching action items:", error)
      reportAPIError(error as Error, '/api/action-items', 'GET')
      
      return NextResponse.json(
        { error: "Failed to fetch action items" },
        { status: 500 }
      )
    }
  }, 'get_action_items_api')
}

/**
 * POST /api/action-items
 * Create a new action item or generate recommendations
 */
export async function POST(request: NextRequest) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const body = await request.json()

      // Check if this is a request to generate recommendations
      if (body.action === 'generate') {
        const actionItems = await ActionItemsService.generateActionItems(session.user.id)
        
        // Format response
        const formattedItems = actionItems.map(item => ({
          ...item,
          actionData: item.actionData ? JSON.parse(item.actionData) : null,
        }))

        return NextResponse.json({
          actionItems: formattedItems,
          generated: formattedItems.length,
          message: `Generated ${formattedItems.length} personalized action items`,
        })
      }

      // Validate request body for manual creation
      const validatedData = createActionItemSchema.parse(body)

      // Calculate expiration date if specified
      const expiresAt = validatedData.expiresInDays
        ? new Date(Date.now() + validatedData.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined

      // Create action item
      const actionItem = await ActionItemsService.createActionItem({
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        actionType: validatedData.actionType,
        actionUrl: validatedData.actionUrl,
        actionData: validatedData.actionData,
        triggerCondition: validatedData.triggerCondition,
        targetGroup: validatedData.targetGroup,
        targetAgeRange: validatedData.targetAgeRange,
        targetServiceRange: validatedData.targetServiceRange,
        relatedCalculationId: validatedData.relatedCalculationId,
        displayOrder: validatedData.displayOrder,
        expiresAt,
        isSystemGenerated: validatedData.isSystemGenerated ?? false,
        generationReason: validatedData.generationReason,
      })

      // Format response
      const formattedItem = {
        ...actionItem,
        actionData: actionItem.actionData ? JSON.parse(actionItem.actionData) : null,
      }

      return NextResponse.json({
        actionItem: formattedItem,
        message: "Action item created successfully",
      }, { status: 201 })

    } catch (error) {
      console.error("Error creating action item:", error)
      reportAPIError(error as Error, '/api/action-items', 'POST')

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
        { error: "Failed to create action item" },
        { status: 500 }
      )
    }
  }, 'create_action_item_api')
}

/**
 * DELETE /api/action-items
 * Cleanup expired action items
 */
export async function DELETE(request: NextRequest) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { searchParams } = new URL(request.url)
      const action = searchParams.get('action')

      if (action === 'cleanup') {
        const cleanedCount = await ActionItemsService.cleanupExpiredItems(session.user.id)
        
        return NextResponse.json({
          message: `Cleaned up ${cleanedCount} expired action items`,
          cleanedCount,
        })
      }

      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )

    } catch (error) {
      console.error("Error cleaning up action items:", error)
      reportAPIError(error as Error, '/api/action-items', 'DELETE')
      
      return NextResponse.json(
        { error: "Failed to cleanup action items" },
        { status: 500 }
      )
    }
  }, 'cleanup_action_items_api')
}
