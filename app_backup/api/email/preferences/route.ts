/**
 * Email Preferences API Endpoint
 * Handles getting and updating user email preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import {
  EmailPreferences,
  validateEmailPreferences,
  mergeWithDefaults,
  EMAIL_PREFERENCE_CATEGORIES,
  DEFAULT_EMAIL_PREFERENCES
} from '@/lib/email/email-preferences'

/**
 * Get user email preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        emailPreferences: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse stored preferences or use defaults
    let preferences: EmailPreferences
    try {
      preferences = user.emailPreferences 
        ? JSON.parse(user.emailPreferences as string)
        : {}
    } catch {
      preferences = DEFAULT_EMAIL_PREFERENCES
    }

    // Merge with defaults
    const mergedPreferences = mergeWithDefaults(preferences)

    return NextResponse.json({
      preferences: mergedPreferences,
      categories: EMAIL_PREFERENCE_CATEGORIES
    })

  } catch (error) {
    console.error('Email preferences get error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Update user email preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preferences } = body

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Valid preferences object is required' },
        { status: 400 }
      )
    }

    // Validate preferences
    const validation = validateEmailPreferences(preferences)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid preferences',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailPreferences: JSON.stringify(preferences)
      },
      select: {
        id: true,
        email: true,
        emailPreferences: true
      }
    })

    // Parse and merge updated preferences
    const updatedPreferences = mergeWithDefaults(
      JSON.parse(updatedUser.emailPreferences as string)
    )

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      message: 'Email preferences updated successfully'
    })

  } catch (error) {
    console.error('Email preferences update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Partially update email preferences (PATCH)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preference, enabled } = body

    if (!preference || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Preference name and enabled status are required' },
        { status: 400 }
      )
    }

    // Check if preference exists
    const preferenceCategory = EMAIL_PREFERENCE_CATEGORIES.find(cat => cat.id === preference)
    if (!preferenceCategory) {
      return NextResponse.json(
        { error: 'Invalid preference type' },
        { status: 400 }
      )
    }

    // Check if preference can be disabled
    if (!enabled && !preferenceCategory.canDisable) {
      return NextResponse.json(
        { error: 'This preference cannot be disabled' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current preferences
    let currentPreferences: Partial<EmailPreferences>
    try {
      currentPreferences = user.emailPreferences 
        ? JSON.parse(user.emailPreferences as string)
        : {}
    } catch {
      currentPreferences = {}
    }

    // Update specific preference
    const updatedPreferences = {
      ...currentPreferences,
      [preference]: enabled
    }

    // Save updated preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailPreferences: JSON.stringify(updatedPreferences)
      },
      select: {
        id: true,
        email: true,
        emailPreferences: true
      }
    })

    // Parse and merge final preferences
    const finalPreferences = mergeWithDefaults(
      JSON.parse(updatedUser.emailPreferences as string)
    )

    return NextResponse.json({
      success: true,
      preferences: finalPreferences,
      updated: {
        preference,
        enabled
      },
      message: `${preferenceCategory.label} preference updated successfully`
    })

  } catch (error) {
    console.error('Email preference patch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
