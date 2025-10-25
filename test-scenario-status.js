// Test script to check scenario status data
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking scenario status data...\n');

// Query scenarios with their results
db.all(`
  SELECT 
    rs.id,
    rs.name,
    rs.isBaseline,
    rs.createdAt,
    sr.id as resultId,
    sr.totalMonthlyIncome,
    sr.replacementRatio,
    sr.riskScore
  FROM RetirementScenario rs
  LEFT JOIN ScenarioResult sr ON rs.id = sr.scenarioId
  WHERE rs.userId = '113615221466278220538'
  ORDER BY rs.createdAt DESC
  LIMIT 10
`, (err, rows) => {
  if (err) {
    console.error('❌ Error querying scenarios:', err);
    return;
  }

  console.log(`📊 Found ${rows.length} scenarios:\n`);
  
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ${row.name}`);
    console.log(`   ID: ${row.id}`);
    console.log(`   Baseline: ${row.isBaseline ? 'Yes' : 'No'}`);
    console.log(`   Has Results: ${row.resultId ? 'Yes ✅' : 'No ❌'}`);
    
    if (row.resultId) {
      console.log(`   Monthly Income: $${row.totalMonthlyIncome?.toLocaleString() || 'N/A'}`);
      console.log(`   Replacement Ratio: ${(row.replacementRatio * 100)?.toFixed(1) || 'N/A'}%`);
      console.log(`   Risk Score: ${row.riskScore || 'N/A'}`);
      console.log(`   Status: CALCULATED 🟢`);
    } else {
      console.log(`   Status: PENDING 🟡`);
    }
    console.log(`   Created: ${new Date(row.createdAt).toLocaleDateString()}\n`);
  });

  // Summary
  const withResults = rows.filter(r => r.resultId).length;
  const withoutResults = rows.length - withResults;
  
  console.log('📈 Summary:');
  console.log(`   Scenarios with results (Calculated): ${withResults}`);
  console.log(`   Scenarios without results (Pending): ${withoutResults}`);
  
  if (withoutResults > 0) {
    console.log('\n🔧 Issue identified: Some scenarios are missing calculated results!');
    console.log('   This explains why they show "Pending" instead of "Calculated" status.');
  } else {
    console.log('\n✅ All scenarios have calculated results!');
  }

  db.close();
});
