// Simple Express server to test profile functionality
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { PrismaClient } = require('./lib/generated/prisma');

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.static('public'));

// Mock session for testing
const mockSession = {
  user: {
    id: 'test-user-simple',
    email: 'test@example.com',
    name: 'Test User Simple'
  }
};

// Profile API endpoint
app.post('/api/profile', async (req, res) => {
  console.log('🔄 Profile API called');
  console.log('📤 Request body:', req.body);
  
  try {
    const prisma = new PrismaClient();
    
    // Simulate session check
    if (!mockSession?.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
        error: "NO_SESSION"
      });
    }

    const requestBody = req.body;
    console.log("Profile POST request body:", requestBody);

    // Validate and prepare data for database
    const profileData = {};

    // Handle both camelCase and snake_case field names for compatibility
    if (requestBody.dateOfBirth || requestBody.date_of_birth) {
      profileData.dateOfBirth = new Date(requestBody.dateOfBirth || requestBody.date_of_birth);
    }
    if (requestBody.membershipDate || requestBody.membership_date) {
      profileData.membershipDate = new Date(requestBody.membershipDate || requestBody.membership_date);
    }
    if (requestBody.retirementGroup || requestBody.retirement_group) {
      profileData.retirementGroup = requestBody.retirementGroup || requestBody.retirement_group;
    }
    if (requestBody.benefitPercentage !== undefined || requestBody.benefit_percentage !== undefined) {
      profileData.benefitPercentage = parseFloat(requestBody.benefitPercentage || requestBody.benefit_percentage);
    }
    if (requestBody.currentSalary !== undefined || requestBody.current_salary !== undefined) {
      profileData.currentSalary = parseFloat(requestBody.currentSalary || requestBody.current_salary);
    }
    if (requestBody.averageHighest3Years !== undefined || requestBody.average_highest_3_years !== undefined) {
      profileData.averageHighest3Years = parseFloat(requestBody.averageHighest3Years || requestBody.average_highest_3_years);
    }
    if (requestBody.yearsOfService !== undefined || requestBody.years_of_service !== undefined) {
      profileData.yearsOfService = parseFloat(requestBody.yearsOfService || requestBody.years_of_service);
    }
    if (requestBody.plannedRetirementAge !== undefined || requestBody.planned_retirement_age !== undefined) {
      profileData.plannedRetirementAge = parseInt(requestBody.plannedRetirementAge || requestBody.planned_retirement_age);
    }
    if (requestBody.retirementOption || requestBody.retirement_option) {
      profileData.retirementOption = requestBody.retirementOption || requestBody.retirement_option;
    }

    // Upsert the profile
    const updatedProfile = await prisma.retirementProfile.upsert({
      where: {
        userId: mockSession.user.id
      },
      update: profileData,
      create: {
        userId: mockSession.user.id,
        dateOfBirth: profileData.dateOfBirth || new Date('1970-01-01'),
        membershipDate: profileData.membershipDate || new Date(),
        retirementGroup: profileData.retirementGroup || 'Group 1',
        benefitPercentage: profileData.benefitPercentage || 2.0,
        currentSalary: profileData.currentSalary || 0,
        ...profileData
      }
    });

    const responseData = {
      message: "Profile updated successfully",
      profile: updatedProfile
    };

    console.log("✅ Profile update successful:", responseData);
    res.json(responseData);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET profile endpoint
app.get('/api/profile', async (req, res) => {
  console.log('🔍 Profile GET called');
  
  try {
    const prisma = new PrismaClient();
    
    if (!mockSession?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userProfile = await prisma.retirementProfile.findUnique({
      where: {
        userId: mockSession.user.id
      }
    });

    const responseData = {
      fullName: mockSession.user.name || "",
      dateOfBirth: userProfile?.dateOfBirth ? userProfile.dateOfBirth.toISOString().split('T')[0] : "",
      membershipDate: userProfile?.membershipDate ? userProfile.membershipDate.toISOString().split('T')[0] : "",
      retirementGroup: userProfile?.retirementGroup || "Group 1",
      benefitPercentage: userProfile?.benefitPercentage || 2.0,
      currentSalary: userProfile?.currentSalary || 0,
      averageHighest3Years: userProfile?.averageHighest3Years || 0,
      yearsOfService: userProfile?.yearsOfService || 0,
      plannedRetirementAge: userProfile?.plannedRetirementAge || 65,
      retirementOption: userProfile?.retirementOption || "A",
      hasProfile: !!userProfile
    };

    console.log("✅ Profile retrieved:", responseData);
    res.json(responseData);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    session: mockSession 
  });
});

// Simple HTML test page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Profile API Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select { width: 100%; padding: 8px; margin-bottom: 10px; }
            button { background: #007cba; color: white; padding: 10px 20px; border: none; cursor: pointer; }
            button:hover { background: #005a87; }
            .result { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧪 Profile API Test Page</h1>
            <p>This page tests the profile API functionality directly.</p>
            
            <div class="form-group">
                <h3>Personal Information</h3>
                <label>Date of Birth:</label>
                <input type="date" id="dateOfBirth" value="1980-01-01">
                
                <label>Membership Date:</label>
                <input type="date" id="membershipDate" value="2010-01-01">
                
                <label>Retirement Group:</label>
                <select id="retirementGroup">
                    <option value="Group 1">Group 1 - General Employees</option>
                    <option value="Group 2">Group 2 - Teachers</option>
                    <option value="Group 3">Group 3 - Public Safety</option>
                </select>
                
                <button onclick="savePersonal()">Save Personal Info</button>
            </div>
            
            <div class="form-group">
                <h3>Employment Information</h3>
                <label>Current Salary:</label>
                <input type="number" id="currentSalary" value="75000">
                
                <label>Average Highest 3 Years:</label>
                <input type="number" id="averageHighest3Years" value="80000">
                
                <label>Years of Service:</label>
                <input type="number" id="yearsOfService" value="15" step="0.1">
                
                <button onclick="saveEmployment()">Save Employment Info</button>
            </div>
            
            <div class="form-group">
                <h3>Retirement Planning</h3>
                <label>Planned Retirement Age:</label>
                <input type="number" id="plannedRetirementAge" value="65" min="50" max="80">
                
                <label>Retirement Option:</label>
                <select id="retirementOption">
                    <option value="A">Option A - Maximum Allowance</option>
                    <option value="B">Option B - 100% Joint & Survivor</option>
                    <option value="C">Option C - 66.7% Joint & Survivor</option>
                </select>
                
                <button onclick="saveRetirement()">Save Retirement Planning</button>
            </div>
            
            <div class="form-group">
                <button onclick="loadProfile()">Load Current Profile</button>
                <button onclick="saveAll()">Save All Data</button>
            </div>
            
            <div id="result" class="result" style="display: none;"></div>
        </div>
        
        <script>
            function showResult(message, isSuccess = true) {
                const result = document.getElementById('result');
                result.style.display = 'block';
                result.className = 'result ' + (isSuccess ? 'success' : 'error');
                result.innerHTML = '<pre>' + JSON.stringify(message, null, 2) + '</pre>';
            }
            
            async function savePersonal() {
                const data = {
                    dateOfBirth: document.getElementById('dateOfBirth').value,
                    membershipDate: document.getElementById('membershipDate').value,
                    retirementGroup: document.getElementById('retirementGroup').value
                };
                
                try {
                    const response = await fetch('/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    showResult(result, response.ok);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
            
            async function saveEmployment() {
                const data = {
                    currentSalary: parseFloat(document.getElementById('currentSalary').value),
                    averageHighest3Years: parseFloat(document.getElementById('averageHighest3Years').value),
                    yearsOfService: parseFloat(document.getElementById('yearsOfService').value)
                };
                
                try {
                    const response = await fetch('/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    showResult(result, response.ok);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
            
            async function saveRetirement() {
                const data = {
                    plannedRetirementAge: parseInt(document.getElementById('plannedRetirementAge').value),
                    retirementOption: document.getElementById('retirementOption').value
                };
                
                try {
                    const response = await fetch('/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    showResult(result, response.ok);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
            
            async function saveAll() {
                const data = {
                    dateOfBirth: document.getElementById('dateOfBirth').value,
                    membershipDate: document.getElementById('membershipDate').value,
                    retirementGroup: document.getElementById('retirementGroup').value,
                    currentSalary: parseFloat(document.getElementById('currentSalary').value),
                    averageHighest3Years: parseFloat(document.getElementById('averageHighest3Years').value),
                    yearsOfService: parseFloat(document.getElementById('yearsOfService').value),
                    plannedRetirementAge: parseInt(document.getElementById('plannedRetirementAge').value),
                    retirementOption: document.getElementById('retirementOption').value
                };
                
                try {
                    const response = await fetch('/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    showResult(result, response.ok);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
            
            async function loadProfile() {
                try {
                    const response = await fetch('/api/profile');
                    const result = await response.json();
                    showResult(result, response.ok);
                    
                    if (response.ok) {
                        // Populate form fields
                        if (result.dateOfBirth) document.getElementById('dateOfBirth').value = result.dateOfBirth;
                        if (result.membershipDate) document.getElementById('membershipDate').value = result.membershipDate;
                        if (result.retirementGroup) document.getElementById('retirementGroup').value = result.retirementGroup;
                        if (result.currentSalary) document.getElementById('currentSalary').value = result.currentSalary;
                        if (result.averageHighest3Years) document.getElementById('averageHighest3Years').value = result.averageHighest3Years;
                        if (result.yearsOfService) document.getElementById('yearsOfService').value = result.yearsOfService;
                        if (result.plannedRetirementAge) document.getElementById('plannedRetirementAge').value = result.plannedRetirementAge;
                        if (result.retirementOption) document.getElementById('retirementOption').value = result.retirementOption;
                    }
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
        </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`🚀 Simple test server running at http://localhost:${port}`);
  console.log(`📋 Test the profile API at http://localhost:${port}`);
  console.log(`🔧 API endpoints:`);
  console.log(`   GET  /api/profile - Retrieve profile data`);
  console.log(`   POST /api/profile - Save profile data`);
  console.log(`   GET  /test - Server health check`);
});
