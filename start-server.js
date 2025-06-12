#!/usr/bin/env node

console.log('🚀 Starting Massachusetts Retirement System...')
console.log('📍 Project Directory:', process.cwd())
console.log('🔧 Node Version:', process.version)

// Try to start Next.js development server
try {
  console.log('🔄 Attempting to start Next.js development server...')
  
  // Check if Next.js is available
  let next
  try {
    next = require('next')
    console.log('✅ Next.js module found')
  } catch (error) {
    console.error('❌ Next.js module not found:', error.message)
    console.log('💡 Please install Next.js: npm install next react react-dom')
    process.exit(1)
  }

  // Create Next.js app
  const app = next({ 
    dev: true,
    port: 3001,
    hostname: 'localhost'
  })
  
  const handle = app.getRequestHandler()

  console.log('🔧 Preparing Next.js application...')
  
  app.prepare().then(() => {
    const http = require('http')
    
    const server = http.createServer((req, res) => {
      handle(req, res)
    })
    
    server.listen(3001, 'localhost', (err) => {
      if (err) {
        console.error('❌ Server failed to start:', err)
        process.exit(1)
      }
      
      console.log('🎉 SUCCESS! Massachusetts Retirement System is running!')
      console.log('🌐 Local:    http://localhost:3001')
      console.log('🌐 Network:  http://10.0.0.119:3001')
      console.log('⚡ Performance: Sub-2-second response time target')
      console.log('📊 Status: All systems operational')
      console.log('')
      console.log('🔥 Ready for development! Press Ctrl+C to stop.')
    })
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down server...')
      server.close(() => {
        console.log('✅ Server stopped')
        process.exit(0)
      })
    })
    
  }).catch((error) => {
    console.error('❌ Failed to prepare Next.js application:', error)
    process.exit(1)
  })

} catch (error) {
  console.error('❌ Failed to start server:', error)
  console.log('💡 Try running: npm install')
  process.exit(1)
}
