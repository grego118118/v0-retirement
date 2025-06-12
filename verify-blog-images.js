/**
 * Blog Image Verification Script
 * Massachusetts Retirement System - Quick verification of blog image fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  Massachusetts Retirement System - Blog Image Verification');
console.log('===========================================================');

// Check if blog image directory exists
const blogImageDir = path.join(__dirname, 'public', 'images', 'blog');

if (!fs.existsSync(blogImageDir)) {
  console.log('❌ Blog image directory does not exist:', blogImageDir);
  process.exit(1);
}

console.log('✅ Blog image directory exists:', blogImageDir);

// List all files in blog image directory
const blogImageFiles = fs.readdirSync(blogImageDir);
console.log(`📁 Found ${blogImageFiles.length} files in blog image directory:`);
blogImageFiles.forEach(file => {
  const filePath = path.join(blogImageDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`   ✅ ${file} (${sizeKB} KB)`);
});

// Check for required image files
const requiredImages = [
  'social-security-fairness-act.svg',
  'pension-options-guide.svg',
  'retirement-planning-timeline.png',
  'maximizing-pension-benefits.png',
  'healthcare-retirement-options.png',
  'creditable-service-guide.svg',
  'default-blog-image.svg'
];

console.log('\n🔍 Checking required images...');
let allImagesPresent = true;

requiredImages.forEach(imageName => {
  const imagePath = path.join(blogImageDir, imageName);
  if (fs.existsSync(imagePath)) {
    console.log(`✅ ${imageName} - EXISTS`);
  } else {
    console.log(`❌ ${imageName} - MISSING`);
    allImagesPresent = false;
  }
});

// Check blog-data.ts for correct image paths
console.log('\n📋 Checking blog-data.ts image references...');

try {
  const blogDataPath = path.join(__dirname, 'lib', 'blog-data.ts');
  const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
  
  // Check for old Unsplash URLs
  const unsplashMatches = blogDataContent.match(/images\.unsplash\.com/g);
  if (unsplashMatches) {
    console.log(`❌ Found ${unsplashMatches.length} Unsplash URLs still in blog-data.ts`);
    allImagesPresent = false;
  } else {
    console.log('✅ No Unsplash URLs found in blog-data.ts');
  }
  
  // Check for correct local image paths
  const localImageMatches = blogDataContent.match(/\/images\/blog\//g);
  if (localImageMatches && localImageMatches.length >= 6) {
    console.log(`✅ Found ${localImageMatches.length} local image references`);
  } else {
    console.log(`⚠️  Found ${localImageMatches ? localImageMatches.length : 0} local image references (expected 6+)`);
  }
  
} catch (error) {
  console.error('❌ Error reading blog-data.ts:', error.message);
  allImagesPresent = false;
}

// Check blog image components
console.log('\n🧩 Checking blog image components...');

const blogImageComponentPath = path.join(__dirname, 'components', 'blog', 'blog-image.tsx');
if (fs.existsSync(blogImageComponentPath)) {
  console.log('✅ BlogImage component exists');
  
  const componentContent = fs.readFileSync(blogImageComponentPath, 'utf8');
  if (componentContent.includes('BlogHeroImage') && componentContent.includes('ResponsiveBlogImage')) {
    console.log('✅ All blog image components are defined');
  } else {
    console.log('❌ Some blog image components are missing');
    allImagesPresent = false;
  }
} else {
  console.log('❌ BlogImage component does not exist');
  allImagesPresent = false;
}

// Final status
console.log('\n🎯 Verification Results');
console.log('=======================');

if (allImagesPresent) {
  console.log('🎉 SUCCESS: All blog images are properly configured!');
  console.log('✅ Image directory structure is correct');
  console.log('✅ All required images are present');
  console.log('✅ Blog data uses local image paths');
  console.log('✅ Image components are implemented');
  
  console.log('\n🚀 Blog images are ready for testing!');
  console.log('📋 Next steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Navigate to /blog');
  console.log('3. Verify images load correctly');
  console.log('4. Test responsive behavior');
  
} else {
  console.log('❌ ISSUES DETECTED: Some blog image setup is incomplete');
  console.log('💡 Review the errors above and fix before testing');
}

console.log('\n✅ Blog image verification complete!');
