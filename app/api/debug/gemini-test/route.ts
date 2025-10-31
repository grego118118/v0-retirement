/**
 * Gemini API Key Diagnostic Endpoint
 * Massachusetts Retirement System - Environment Variable Testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * GET /api/debug/gemini-test
 * Test GEMINI_API_KEY accessibility and format
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test environment variable access
    const geminiApiKey = process.env.GEMINI_API_KEY
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        platform: process.platform
      },
      gemini_api_key: {
        exists: !!geminiApiKey,
        is_string: typeof geminiApiKey === 'string',
        length: geminiApiKey ? geminiApiKey.length : 0,
        starts_with_ai: geminiApiKey ? geminiApiKey.startsWith('AIza') : false,
        format_check: geminiApiKey ? /^AIza[a-zA-Z0-9_-]{30,}$/.test(geminiApiKey) : false,
        first_10_chars: geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'N/A',
        last_4_chars: geminiApiKey && geminiApiKey.length > 10 ? '...' + geminiApiKey.slice(-4) : 'N/A'
      },
      other_ai_keys: {
        openai_exists: !!process.env.OPENAI_API_KEY,
        anthropic_exists: !!process.env.ANTHROPIC_API_KEY,
        cron_secret_exists: !!process.env.CRON_SECRET
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics,
      message: geminiApiKey ? 'GEMINI_API_KEY is accessible' : 'GEMINI_API_KEY is missing'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Diagnostic test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POST /api/debug/gemini-test
 * Test direct Gemini API call with configured key
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not found in environment'
      }, { status: 500 })
    }

    // Test direct Gemini API call
    // Try to list available models first to debug
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`

    try {
      const listResponse = await fetch(listModelsUrl)
      const listData = await listResponse.json()
      console.log('Available models:', listData)
    } catch (e) {
      console.log('Error listing models:', e)
    }

    // Use gemini-1.5-flash which should be available
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`
    
    const testPayload = {
      contents: [{
        parts: [{
          text: "Write a single sentence about Massachusetts retirement benefits. Keep it under 20 words."
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        topP: 0.8,
        topK: 40
      }
    }

    console.log('Testing direct Gemini API call...')
    console.log('URL:', geminiUrl.replace(geminiApiKey, 'AI***REDACTED***'))
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    const startTime = Date.now()
    
    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      console.log(`Gemini API response: ${response.status} (${responseTime}ms)`)
      
      if (response.ok) {
        const data = await response.json()
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text generated'
        
        return NextResponse.json({
          success: true,
          gemini_test: {
            status: response.status,
            response_time_ms: responseTime,
            generated_text: generatedText,
            api_key_working: true
          },
          message: 'Direct Gemini API call successful'
        })
      } else {
        const errorText = await response.text()
        console.error('Gemini API error:', errorText)
        
        return NextResponse.json({
          success: false,
          gemini_test: {
            status: response.status,
            response_time_ms: responseTime,
            error: errorText,
            api_key_working: false
          },
          message: 'Direct Gemini API call failed'
        })
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (fetchError.name === 'AbortError') {
        console.error('Gemini API call timed out after 15 seconds')
        return NextResponse.json({
          success: false,
          gemini_test: {
            status: 'timeout',
            response_time_ms: responseTime,
            error: 'Request timed out after 15 seconds',
            api_key_working: false
          },
          message: 'Direct Gemini API call timed out'
        })
      } else {
        console.error('Gemini API fetch error:', fetchError)
        return NextResponse.json({
          success: false,
          gemini_test: {
            status: 'network_error',
            response_time_ms: responseTime,
            error: fetchError.message,
            api_key_working: false
          },
          message: 'Network error during Gemini API call'
        })
      }
    }

  } catch (error) {
    console.error('Gemini test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Gemini test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
