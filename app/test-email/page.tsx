'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TestEmailPage() {
  const { data: session, status } = useSession()
  const [emailResult, setEmailResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEmail = async () => {
    setLoading(true)
    setEmailResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType: 'basic' })
      })

      const result = await response.json()
      setEmailResult(result)
    } catch (error) {
      setEmailResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testTemplateEmail = async () => {
    setLoading(true)
    setEmailResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType: 'template' })
      })

      const result = await response.json()
      setEmailResult(result)
    } catch (error) {
      setEmailResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  if (!session) {
    return <div className="p-8">Please sign in to test email functionality.</div>
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Email Service Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Email Configuration</h2>
        <p className="text-gray-600 mb-4">
          Test the Resend email service integration with your configured API key.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={testEmail}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Sending...' : 'Test Basic Email'}
          </button>
          
          <button
            onClick={testTemplateEmail}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors ml-4"
          >
            {loading ? 'Sending...' : 'Test Template Email'}
          </button>
        </div>
      </div>

      {emailResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Result</h3>
          
          <div className={`p-4 rounded-lg mb-4 ${
            emailResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${emailResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {emailResult.success ? '✅ Email Sent Successfully!' : '❌ Email Failed'}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div><strong>Provider:</strong> {emailResult.provider}</div>
            <div><strong>User Email:</strong> {emailResult.userEmail}</div>
            <div><strong>Timestamp:</strong> {emailResult.timestamp}</div>
            {emailResult.messageId && (
              <div><strong>Message ID:</strong> {emailResult.messageId}</div>
            )}
            {emailResult.testType && (
              <div><strong>Test Type:</strong> {emailResult.testType}</div>
            )}
            {emailResult.error && (
              <div className="text-red-600"><strong>Error:</strong> {emailResult.error}</div>
            )}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              View Full Response
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(emailResult, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Note:</strong> This test will send an actual email to your authenticated email address ({session.user?.email}).</p>
        <p>Check your inbox and spam folder for the test email.</p>
      </div>
    </div>
  )
}
