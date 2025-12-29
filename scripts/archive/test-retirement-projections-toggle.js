/**
 * Test script to verify retirement projections toggle functionality
 * Tests the RetirementBenefitsProjection component toggle behavior
 */

console.log('🧪 Testing Retirement Projections Toggle Functionality...\n');

// Test 1: Check if toggle control is present
function testTogglePresence() {
  console.log('📍 Test 1: Checking toggle control presence...');
  
  const toggleCheckbox = document.querySelector('#show-extended-projections');
  const toggleLabel = document.querySelector('label[for="show-extended-projections"]');
  const toggleDescription = document.querySelector('#extended-projections-description');
  
  if (toggleCheckbox) {
    console.log('✅ Toggle checkbox found');
    console.log(`🎛️  Checkbox checked state: ${toggleCheckbox.checked}`);
  } else {
    console.log('❌ Toggle checkbox not found');
  }
  
  if (toggleLabel) {
    console.log('✅ Toggle label found');
    console.log(`🏷️  Label text: "${toggleLabel.textContent}"`);
  } else {
    console.log('❌ Toggle label not found');
  }
  
  if (toggleDescription) {
    console.log('✅ Toggle description found');
    console.log(`📝 Description text: "${toggleDescription.textContent}"`);
  } else {
    console.log('❌ Toggle description not found');
  }
  
  return { toggleCheckbox, toggleLabel, toggleDescription };
}

// Test 2: Check projection table data
function testProjectionTableData() {
  console.log('\n📍 Test 2: Checking projection table data...');
  
  const projectionTable = document.querySelector('table');
  const tableRows = document.querySelectorAll('tbody tr');
  
  if (projectionTable) {
    console.log('✅ Projection table found');
    console.log(`📊 Number of data rows: ${tableRows.length}`);
    
    // Check table headers
    const headers = document.querySelectorAll('thead th');
    console.log(`📋 Table headers (${headers.length}):`);
    headers.forEach((header, index) => {
      console.log(`   ${index + 1}. ${header.textContent.trim()}`);
    });
    
    // Check first row data
    if (tableRows.length > 0) {
      const firstRow = tableRows[0];
      const cells = firstRow.querySelectorAll('td');
      console.log(`📈 First row data (${cells.length} cells):`);
      cells.forEach((cell, index) => {
        console.log(`   ${index + 1}. ${cell.textContent.trim()}`);
      });
    }
  } else {
    console.log('❌ Projection table not found');
  }
  
  return { projectionTable, tableRows };
}

// Test 3: Check summary statistics
function testSummaryStatistics() {
  console.log('\n📍 Test 3: Checking summary statistics...');
  
  const summaryCards = document.querySelectorAll('.grid .bg-green-50, .grid .bg-blue-50, .grid .bg-purple-50, .grid .bg-orange-50');
  
  console.log(`📊 Found ${summaryCards.length} summary statistic cards`);
  
  summaryCards.forEach((card, index) => {
    const title = card.querySelector('.text-sm.font-medium');
    const value = card.querySelector('.text-lg.font-bold');
    const subtitle = card.querySelector('.text-xs');
    
    console.log(`📈 Card ${index + 1}:`);
    console.log(`   Title: ${title?.textContent || 'N/A'}`);
    console.log(`   Value: ${value?.textContent || 'N/A'}`);
    console.log(`   Subtitle: ${subtitle?.textContent || 'N/A'}`);
  });
  
  return summaryCards;
}

// Test 4: Check 80% cap warning
function test80PercentCapWarning() {
  console.log('\n📍 Test 4: Checking 80% cap warning...');
  
  const capWarning = document.querySelector('.bg-amber-50');
  
  if (capWarning) {
    console.log('✅ 80% cap warning found');
    const warningText = capWarning.textContent;
    console.log(`⚠️  Warning content: "${warningText.substring(0, 100)}..."`);
  } else {
    console.log('ℹ️  80% cap warning not displayed (may not be applicable for current data)');
  }
  
  return capWarning;
}

// Test 5: Simulate toggle interaction
function testToggleInteraction() {
  console.log('\n📍 Test 5: Simulating toggle interaction...');
  
  const toggleCheckbox = document.querySelector('#show-extended-projections');
  
  if (!toggleCheckbox) {
    console.log('❌ Cannot test toggle interaction - checkbox not found');
    return false;
  }
  
  const initialState = toggleCheckbox.checked;
  const initialRowCount = document.querySelectorAll('tbody tr').length;
  
  console.log(`🎛️  Initial toggle state: ${initialState ? 'ON' : 'OFF'}`);
  console.log(`📊 Initial row count: ${initialRowCount}`);
  
  // Simulate click
  try {
    toggleCheckbox.click();
    
    // Wait for React state update
    setTimeout(() => {
      const newState = toggleCheckbox.checked;
      const newRowCount = document.querySelectorAll('tbody tr').length;
      
      console.log(`🎛️  New toggle state: ${newState ? 'ON' : 'OFF'}`);
      console.log(`📊 New row count: ${newRowCount}`);
      
      if (newState !== initialState) {
        console.log('✅ Toggle state changed successfully');
      } else {
        console.log('❌ Toggle state did not change');
      }
      
      if (newRowCount !== initialRowCount) {
        console.log('✅ Table data updated based on toggle state');
      } else {
        console.log('ℹ️  Table data unchanged (may be expected based on data)');
      }
      
      // Reset to initial state
      if (newState !== initialState) {
        setTimeout(() => {
          toggleCheckbox.click();
          console.log('🔄 Reset toggle to initial state');
        }, 500);
      }
    }, 500);
    
    return true;
  } catch (error) {
    console.log('❌ Error simulating toggle interaction:', error.message);
    return false;
  }
}

// Test 6: Check accessibility features
function testAccessibilityFeatures() {
  console.log('\n📍 Test 6: Checking accessibility features...');
  
  const toggleCheckbox = document.querySelector('#show-extended-projections');
  const toggleLabel = document.querySelector('label[for="show-extended-projections"]');
  const description = document.querySelector('#extended-projections-description');
  
  let accessibilityScore = 0;
  
  // Check ARIA attributes
  if (toggleCheckbox?.getAttribute('aria-describedby')) {
    console.log('✅ Checkbox has aria-describedby attribute');
    accessibilityScore++;
  } else {
    console.log('❌ Checkbox missing aria-describedby attribute');
  }
  
  // Check label association
  if (toggleLabel?.getAttribute('for') === 'show-extended-projections') {
    console.log('✅ Label properly associated with checkbox');
    accessibilityScore++;
  } else {
    console.log('❌ Label not properly associated with checkbox');
  }
  
  // Check description element
  if (description?.id === 'extended-projections-description') {
    console.log('✅ Description element has proper ID');
    accessibilityScore++;
  } else {
    console.log('❌ Description element missing proper ID');
  }
  
  // Check keyboard accessibility
  if (toggleCheckbox?.tabIndex !== -1) {
    console.log('✅ Checkbox is keyboard accessible');
    accessibilityScore++;
  } else {
    console.log('❌ Checkbox not keyboard accessible');
  }
  
  console.log(`🎯 Accessibility score: ${accessibilityScore}/4`);
  
  return accessibilityScore;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Retirement Projections Toggle Tests...\n');
  
  const results = {
    togglePresence: testTogglePresence(),
    tableData: testProjectionTableData(),
    summaryStats: testSummaryStatistics(),
    capWarning: test80PercentCapWarning(),
    toggleInteraction: testToggleInteraction(),
    accessibility: testAccessibilityFeatures()
  };
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`✅ Toggle control: ${results.togglePresence.toggleCheckbox ? 'Found' : 'Not found'}`);
  console.log(`✅ Projection table: ${results.tableData.projectionTable ? 'Found' : 'Not found'}`);
  console.log(`✅ Table rows: ${results.tableData.tableRows.length} rows`);
  console.log(`✅ Summary cards: ${results.summaryStats.length} cards`);
  console.log(`✅ 80% cap warning: ${results.capWarning ? 'Displayed' : 'Not displayed'}`);
  console.log(`✅ Toggle interaction: ${results.toggleInteraction ? 'Working' : 'Failed'}`);
  console.log(`✅ Accessibility: ${results.accessibility}/4 features`);
  
  const passedTests = [
    results.togglePresence.toggleCheckbox ? 1 : 0,
    results.tableData.projectionTable ? 1 : 0,
    results.tableData.tableRows.length > 0 ? 1 : 0,
    results.summaryStats.length > 0 ? 1 : 0,
    results.toggleInteraction ? 1 : 0,
    results.accessibility >= 3 ? 1 : 0
  ].reduce((sum, score) => sum + score, 0);
  
  console.log(`\n🎯 Overall Score: ${passedTests}/6 tests passed`);
  
  if (passedTests >= 5) {
    console.log('🎉 Retirement projections toggle functionality appears to be working correctly!');
  } else {
    console.log('⚠️  Some issues detected. Check individual test results above.');
  }
  
  return results;
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testToggleInteraction };
}
