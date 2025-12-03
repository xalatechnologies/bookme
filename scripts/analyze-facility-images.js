// @ts-check
/**
 * Script to analyze facility images for duplicates
 * 
 * Run with: node scripts/analyze-facility-images.js
 */

// Read the SQL file
const fs = require('fs');
const path = require('path');

// Function to extract image URLs from SQL
function extractImagesFromSQL(sqlContent) {
  const facilities = {};
  const facilityRegex = /-- Update (.+?)\s+UPDATE facilities[\s\S]*?SET images = '\[\s*([\s\S]*?)\s*\]'::jsonb/g;
  let match;
  
  while ((match = facilityRegex.exec(sqlContent)) !== null) {
    const facilityName = match[1].split('(')[0].trim();
    const imagesContent = match[2];
    
    // Extract URLs
    const urlRegex = /https:\/\/images\.unsplash\.com\/[^\s,]+/g;
    const urls = [];
    let urlMatch;
    
    while ((urlMatch = urlRegex.exec(imagesContent)) !== null) {
      urls.push(urlMatch[0]);
    }
    
    facilities[facilityName] = urls;
  }
  
  return facilities;
}

// Function to find duplicates
function findDuplicates(facilities) {
  const allImages = [];
  const facilityImageMap = new Map();
  
  // Collect all images
  for (const [facility, images] of Object.entries(facilities)) {
    facilityImageMap.set(facility, images);
    allImages.push(...images.map(img => ({ facility, url: img })));
  }
  
  // Check for duplicates
  const imageCounts = new Map();
  allImages.forEach(({ facility, url }) => {
    if (!imageCounts.has(url)) {
      imageCounts.set(url, []);
    }
    imageCounts.get(url).push(facility);
  });
  
  const duplicates = Array.from(imageCounts.entries())
    .filter(([url, facilities]) => facilities.length > 1)
    .map(([url, facilities]) => ({ url, facilities }));
  
  return { duplicates, totalImages: allImages.length, uniqueImages: imageCounts.size };
}

// Main function
function main() {
  try {
    const sqlPath = path.join(__dirname, 'update-facility-images-with-unique-urls.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔍 Analyzing facility images for duplicates...\n');
    
    const facilities = extractImagesFromSQL(sqlContent);
    const { duplicates, totalImages, uniqueImages } = findDuplicates(facilities);
    
    console.log(`📊 Total images across all facilities: ${totalImages}`);
    console.log(`🖼️  Unique images: ${uniqueImages}`);
    console.log(`🔁 Duplicate images: ${duplicates.length}\n`);
    
    if (duplicates.length > 0) {
      console.log('❌ Found duplicate images:');
      duplicates.forEach(({ url, facilities }) => {
        console.log(`   📍 ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`);
        console.log(`      Used by: ${facilities.join(', ')}`);
      });
    } else {
      console.log('✅ No duplicate images found!');
    }
    
    console.log('\n📋 Images per facility:');
    for (const [facility, images] of Object.entries(facilities)) {
      console.log(`   🏢 ${facility}: ${images.length} images`);
    }
    
  } catch (error) {
    console.error('Error analyzing facility images:', error);
  }
}

// Run the script
main();