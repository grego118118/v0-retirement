/**
 * Simple test to verify React-PDF is working correctly with dynamic imports
 */

import React from 'react'

async function testReactPDF() {
  console.log('🧪 Testing React-PDF library with dynamic imports...\n')

  try {
    // Test dynamic import
    console.log('1. Testing dynamic import...')
    const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')
    console.log('✅ React-PDF dynamic import successful')

    // Test basic component creation
    console.log('2. Testing component creation...')
    const TestDocument = React.createElement(Document, {},
      React.createElement(Page, { size: 'A4', style: { padding: 30 } },
        React.createElement(View, {},
          React.createElement(Text, {}, 'Test PDF Document - Dynamic Import')
        )
      )
    )
    console.log('✅ React component creation successful')

    // Test PDF generation
    console.log('3. Testing PDF generation...')
    const pdfBlob = await pdf(TestDocument).toBlob()
    console.log(`✅ PDF generation successful - Size: ${pdfBlob.size} bytes`)

    console.log('\n🎉 All React-PDF tests passed with dynamic imports!')
    return true

  } catch (error) {
    console.error('❌ React-PDF test failed:', error)
    console.error('Stack trace:', error.stack)
    return false
  }
}

testReactPDF().then(success => {
  if (success) {
    console.log('\n📝 React-PDF is working correctly')
    console.log('The issue might be elsewhere in the application')
  } else {
    console.log('\n⚠️ React-PDF has issues that need to be resolved')
  }
  process.exit(success ? 0 : 1)
})
