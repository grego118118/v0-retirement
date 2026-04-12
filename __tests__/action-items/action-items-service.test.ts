import { ActionItemsService } from '@/lib/recommendations/action-items-service'
import { ActionItem } from '@prisma/client'

// Mock Prisma
const mockPrisma = {
  actionItem: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  retirementProfile: {
    findUnique: jest.fn(),
  },
  retirementCalculation: {
    findMany: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock error monitoring
jest.mock('@/components/error-boundary/error-monitoring', () => ({
  monitorAsyncOperation: jest.fn((operation) => operation()),
}))

// Mock recommendation engine
jest.mock('@/lib/recommendations/recommendation-engine', () => ({
  recommendationEngine: {
    analyzeUser: jest.fn(),
    generateRecommendations: jest.fn(),
  },
}))

describe('ActionItemsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserActionItems', () => {
    it('should fetch user action items with default filters', async () => {
      const mockActionItems = [
        {
          id: 'item1',
          userId: 'user1',
          title: 'Complete Profile',
          status: 'pending',
          category: 'profile',
          priority: 'high',
        },
      ]

      mockPrisma.actionItem.findMany.mockResolvedValue(mockActionItems)

      const result = await ActionItemsService.getUserActionItems('user1')

      expect(mockPrisma.actionItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          status: { notIn: ['completed', 'dismissed'] },
        },
        include: {
          relatedCalculation: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      })

      expect(result).toEqual(mockActionItems)
    })

    it('should apply status filters correctly', async () => {
      mockPrisma.actionItem.findMany.mockResolvedValue([])

      await ActionItemsService.getUserActionItems('user1', {
        status: ['pending', 'in-progress'],
      })

      expect(mockPrisma.actionItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          status: { in: ['pending', 'in-progress'] },
        },
        include: {
          relatedCalculation: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    })

    it('should apply category filters correctly', async () => {
      mockPrisma.actionItem.findMany.mockResolvedValue([])

      await ActionItemsService.getUserActionItems('user1', {
        category: 'profile',
      })

      expect(mockPrisma.actionItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          status: { notIn: ['completed', 'dismissed'] },
          category: 'profile',
        },
        include: {
          relatedCalculation: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    })

    it('should include completed items when requested', async () => {
      mockPrisma.actionItem.findMany.mockResolvedValue([])

      await ActionItemsService.getUserActionItems('user1', {
        includeCompleted: true,
        includeDismissed: true,
      })

      expect(mockPrisma.actionItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
        },
        include: {
          relatedCalculation: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    })
  })

  describe('getActionItem', () => {
    it('should fetch a specific action item', async () => {
      const mockActionItem = {
        id: 'item1',
        userId: 'user1',
        title: 'Complete Profile',
      }

      mockPrisma.actionItem.findFirst.mockResolvedValue(mockActionItem)

      const result = await ActionItemsService.getActionItem('item1', 'user1')

      expect(mockPrisma.actionItem.findFirst).toHaveBeenCalledWith({
        where: { id: 'item1', userId: 'user1' },
        include: {
          relatedCalculation: true,
        },
      })

      expect(result).toEqual(mockActionItem)
    })

    it('should return null if action item not found', async () => {
      mockPrisma.actionItem.findFirst.mockResolvedValue(null)

      const result = await ActionItemsService.getActionItem('nonexistent', 'user1')

      expect(result).toBeNull()
    })
  })

  describe('createActionItem', () => {
    it('should create a new action item', async () => {
      const createData = {
        userId: 'user1',
        title: 'Complete Profile',
        description: 'Add missing profile information',
        category: 'profile' as const,
        priority: 'high' as const,
        actionType: 'navigate' as const,
        actionUrl: '/profile',
      }

      const mockCreatedItem = {
        id: 'item1',
        ...createData,
        status: 'pending',
        displayOrder: 0,
        isSystemGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.actionItem.create.mockResolvedValue(mockCreatedItem)

      const result = await ActionItemsService.createActionItem(createData)

      expect(mockPrisma.actionItem.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          actionData: null,
          status: 'pending',
          displayOrder: 0,
          isSystemGenerated: true,
        },
      })

      expect(result).toEqual(mockCreatedItem)
    })

    it('should serialize actionData as JSON', async () => {
      const createData = {
        userId: 'user1',
        title: 'Complete Profile',
        description: 'Add missing profile information',
        category: 'profile' as const,
        priority: 'high' as const,
        actionType: 'navigate' as const,
        actionData: { focusArea: 'salary' },
      }

      mockPrisma.actionItem.create.mockResolvedValue({} as any)

      await ActionItemsService.createActionItem(createData)

      expect(mockPrisma.actionItem.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          actionData: '{"focusArea":"salary"}',
          status: 'pending',
          displayOrder: 0,
          isSystemGenerated: true,
        },
      })
    })
  })

  describe('updateActionItem', () => {
    it('should update an existing action item', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'completed' as const,
      }

      const mockUpdatedItem = {
        id: 'item1',
        userId: 'user1',
        ...updateData,
        completedAt: new Date(),
      }

      mockPrisma.actionItem.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.actionItem.findFirst.mockResolvedValue(mockUpdatedItem)

      const result = await ActionItemsService.updateActionItem('item1', 'user1', updateData)

      expect(mockPrisma.actionItem.updateMany).toHaveBeenCalledWith({
        where: { id: 'item1', userId: 'user1' },
        data: {
          ...updateData,
          completedAt: expect.any(Date),
        },
      })

      expect(result).toEqual(mockUpdatedItem)
    })

    it('should set completion timestamp when status is completed', async () => {
      const updateData = { status: 'completed' as const }

      mockPrisma.actionItem.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.actionItem.findFirst.mockResolvedValue({} as any)

      await ActionItemsService.updateActionItem('item1', 'user1', updateData)

      expect(mockPrisma.actionItem.updateMany).toHaveBeenCalledWith({
        where: { id: 'item1', userId: 'user1' },
        data: {
          status: 'completed',
          completedAt: expect.any(Date),
        },
      })
    })

    it('should set dismissal timestamp when status is dismissed', async () => {
      const updateData = { status: 'dismissed' as const }

      mockPrisma.actionItem.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.actionItem.findFirst.mockResolvedValue({} as any)

      await ActionItemsService.updateActionItem('item1', 'user1', updateData)

      expect(mockPrisma.actionItem.updateMany).toHaveBeenCalledWith({
        where: { id: 'item1', userId: 'user1' },
        data: {
          status: 'dismissed',
          dismissedAt: expect.any(Date),
        },
      })
    })
  })

  describe('deleteActionItem', () => {
    it('should delete an action item', async () => {
      mockPrisma.actionItem.deleteMany.mockResolvedValue({ count: 1 })

      const result = await ActionItemsService.deleteActionItem('item1', 'user1')

      expect(mockPrisma.actionItem.deleteMany).toHaveBeenCalledWith({
        where: { id: 'item1', userId: 'user1' },
      })

      expect(result).toBe(true)
    })

    it('should return false if no item was deleted', async () => {
      mockPrisma.actionItem.deleteMany.mockResolvedValue({ count: 0 })

      const result = await ActionItemsService.deleteActionItem('nonexistent', 'user1')

      expect(result).toBe(false)
    })
  })

  describe('generateActionItems', () => {
    it('should generate action items based on user analysis', async () => {
      const { recommendationEngine } = require('@/lib/recommendations/recommendation-engine')

      const mockProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1970-01-01'),
        membershipDate: new Date('2000-01-01'),
      }

      const mockCalculations = [
        {
          id: 'calc1',
          userId: 'user1',
          retirementAge: 65,
          monthlyBenefit: 3000,
        },
      ]

      const mockAnalysis = {
        profile: mockProfile,
        calculations: mockCalculations,
        currentAge: 54,
        yearsOfService: 24,
        retirementReadiness: 'on-track',
        missingData: [],
        opportunities: [],
        risks: [],
      }

      const mockRecommendations = [
        {
          title: 'Update Your Calculations',
          description: 'Your calculations are outdated',
          category: 'calculation',
          priority: 'medium',
          actionType: 'navigate',
          actionUrl: '/calculator',
          triggerCondition: 'outdated_calculations',
          generationReason: 'Calculations are over 90 days old',
        },
      ]

      mockPrisma.retirementProfile.findUnique.mockResolvedValue(mockProfile)
      mockPrisma.retirementCalculation.findMany.mockResolvedValue(mockCalculations)
      mockPrisma.actionItem.findMany.mockResolvedValue([])

      recommendationEngine.analyzeUser.mockReturnValue(mockAnalysis)
      recommendationEngine.generateRecommendations.mockReturnValue(mockRecommendations)

      mockPrisma.actionItem.create.mockResolvedValue({
        id: 'item1',
        userId: 'user1',
        title: 'Update Your Calculations',
        actionData: null,
      })

      const result = await ActionItemsService.generateActionItems('user1')

      expect(recommendationEngine.analyzeUser).toHaveBeenCalledWith(mockProfile, mockCalculations)
      expect(recommendationEngine.generateRecommendations).toHaveBeenCalled()
      expect(mockPrisma.actionItem.create).toHaveBeenCalled()
      expect(result).toHaveLength(1)
    })
  })

  describe('getActionItemsStats', () => {
    it('should calculate action items statistics', async () => {
      const mockItems = [
        { status: 'pending', category: 'profile', priority: 'high' },
        { status: 'completed', category: 'calculation', priority: 'medium' },
        { status: 'dismissed', category: 'planning', priority: 'low' },
        { status: 'in-progress', category: 'profile', priority: 'high' },
      ]

      mockPrisma.actionItem.findMany.mockResolvedValue(mockItems)

      const result = await ActionItemsService.getActionItemsStats('user1')

      expect(result.total).toBe(4)
      expect(result.pending).toBe(1)
      expect(result.completed).toBe(1)
      expect(result.dismissed).toBe(1)
      expect(result.inProgress).toBe(1)
      expect(result.byCategory.profile).toBe(2)
      expect(result.byCategory.calculation).toBe(1)
      expect(result.byCategory.planning).toBe(1)
      expect(result.byPriority.high).toBe(2)
      expect(result.byPriority.medium).toBe(1)
      expect(result.byPriority.low).toBe(1)
    })
  })

  describe('cleanupExpiredItems', () => {
    it('should cleanup expired action items', async () => {
      mockPrisma.actionItem.updateMany.mockResolvedValue({ count: 3 })

      const result = await ActionItemsService.cleanupExpiredItems('user1')

      expect(mockPrisma.actionItem.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          expiresAt: { lt: expect.any(Date) },
          status: { in: ['pending', 'in-progress'] },
        },
        data: {
          status: 'dismissed',
          dismissedAt: expect.any(Date),
          dismissalReason: 'Expired automatically',
        },
      })

      expect(result).toBe(3)
    })

    it('should cleanup expired items for all users when no userId provided', async () => {
      mockPrisma.actionItem.updateMany.mockResolvedValue({ count: 10 })

      const result = await ActionItemsService.cleanupExpiredItems()

      expect(mockPrisma.actionItem.updateMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
          status: { in: ['pending', 'in-progress'] },
        },
        data: {
          status: 'dismissed',
          dismissedAt: expect.any(Date),
          dismissalReason: 'Expired automatically',
        },
      })

      expect(result).toBe(10)
    })
  })
})
