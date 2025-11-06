/**
 * Debug script to test facility save functionality
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Facility Save Functionality');
console.log('=====================================');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the updateDescriptionWithContact function
console.log('\n1. Testing updateDescriptionWithContact function...');

const updateDescriptionWithContact = (description, email, phone) => {
  // Remove any existing contact information from the description
  let cleanDescription = description || '';
  
  // Remove email patterns
  cleanDescription = cleanDescription.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g, '');
  
  // Remove phone patterns
  cleanDescription = cleanDescription.replace(/(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g, '');
  
  // Clean up extra whitespace
  cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim();
  
  // Add contact information at the end
  if (email || phone) {
    if (cleanDescription) {
      cleanDescription += '. ';
    }
    cleanDescription += `Contact: ${email || 'N/A'}, ${phone || 'N/A'}`;
  }
  
  return cleanDescription;
};

// Test the function
const testDescription = "Beautiful sports hall with great facilities. Contact: old@example.com, +47 00 00 00 00";
const newEmail = "admin@facility.no";
const newPhone = "+47 99 88 77 66";

const updatedDescription = updateDescriptionWithContact(testDescription, newEmail, newPhone);
console.log(`Original: "${testDescription}"`);
console.log(`Updated: "${updatedDescription}"`);

console.log('\n2. Testing database connection...');

// Test database connection by fetching a facility
async function testDatabase() {
  try {
    // Try to fetch facilities (this will test the connection)
    const { data, error } = await supabase
      .from('facilities')
      .select('id, name, contact_email, contact_phone')
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error.message);
      return;
    }

    console.log('✅ Database connection successful');
    console.log(`✅ Found ${data.length} facilities`);
    if (data.length > 0) {
      console.log(`✅ Sample facility: ${data[0].name}`);
      console.log(`✅ Contact email: ${data[0].contact_email || 'Not set'}`);
      console.log(`✅ Contact phone: ${data[0].contact_phone || 'Not set'}`);
    }
  } catch (error) {
    console.error('❌ Unexpected error during database test:', error.message);
  }
}

// Run the database test
testDatabase().then(() => {
  console.log('\n🎉 Debug script completed!');
  console.log('📋 Next steps:');
  console.log('   1. Check browser console for JavaScript errors');
  console.log('   2. Verify that the facility edit form is properly updating state');
  console.log('   3. Check network tab in browser dev tools for failed API requests');
});