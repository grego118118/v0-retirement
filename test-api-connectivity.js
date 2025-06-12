// Test API connectivity and response format
const fetch = require('node-fetch');

async function testAPIConnectivity() {
  console.log('🔍 Testing API Connectivity...\n');
  
  const baseURL = 'http://localhost:3000';
  const endpoints = [
    { method: 'GET', url: '/api/profile', description: 'Profile GET endpoint' },
    { method: 'POST', url: '/api/profile', description: 'Profile POST endpoint', body: { test: true } }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.description}...`);
      console.log(`   URL: ${baseURL}${endpoint.url}`);
      console.log(`   Method: ${endpoint.method}`);
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Script/1.0'
        }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
        console.log(`   Body: ${options.body}`);
      }
      
      const response = await fetch(`${baseURL}${endpoint.url}`, options);
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log(`   Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint.description} - ACCESSIBLE`);
      } else {
        console.log(`   ❌ ${endpoint.description} - ERROR ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   💥 ${endpoint.description} - FAILED`);
      console.log(`   Error: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log(`   🔧 Server not running on ${baseURL}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test basic server connectivity
  console.log('🌐 Testing basic server connectivity...');
  try {
    const response = await fetch(baseURL);
    console.log(`✅ Server is running on ${baseURL}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`❌ Server not accessible on ${baseURL}`);
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`\n🔧 SOLUTION: Start the development server with:`);
      console.log(`   npm run dev`);
      console.log(`   or`);
      console.log(`   npx next dev`);
    }
  }
}

// Test different ports
async function testMultiplePorts() {
  const ports = [3000, 3001, 3002];
  
  console.log('\n🔍 Testing multiple ports...\n');
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      console.log(`✅ Server found on port ${port} - Status: ${response.status}`);
      return port;
    } catch (error) {
      console.log(`❌ No server on port ${port}`);
    }
  }
  
  console.log('\n💡 No servers found on common ports (3000, 3001, 3002)');
  return null;
}

async function main() {
  console.log('🚀 API Connectivity Test\n');
  
  // First check if any server is running
  const activePort = await testMultiplePorts();
  
  if (activePort) {
    console.log(`\n🎯 Testing API endpoints on port ${activePort}...\n`);
    // Update base URL and test
    const originalLog = console.log;
    console.log = (...args) => originalLog(...args.map(arg => 
      typeof arg === 'string' ? arg.replace('http://localhost:3000', `http://localhost:${activePort}`) : arg
    ));
    
    await testAPIConnectivity();
  } else {
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Or start production server: npm run build && npm start');
    console.log('3. Then run this test again');
  }
}

main().catch(console.error);
