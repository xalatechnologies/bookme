/**
 * Simple Supabase Connection Test
 * 
 * This script tests the connection to Supabase Cloud using the configured environment variables.
 * It verifies that the application can connect to the Supabase Cloud instance and perform
 * a simple read operation.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection');
console.log('============================');

// Validate configuration
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

console.log(`🔗 Supabase URL: ${supabaseUrl}`);
console.log(`👤 Anon Key: ${supabaseAnonKey.substring(0, 4)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 4)}`);

// Validate URL format
if (!supabaseUrl.includes('.supabase.co')) {
  console.error('❌ Supabase URL does not point to Supabase Cloud (*.supabase.co)');
  process.exit(1);
}

if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
  console.error('❌ Supabase URL points to localhost instead of Supabase Cloud');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection with a simple query
async function testConnection() {
  try {
    console.log('\n📡 Testing connection to Supabase Cloud...');
    
    // Try to get the current session (this will test the connection)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Authentication error:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase Cloud');
    console.log('✅ Authentication working correctly');
    
    // Try a simple database query (read from a public table if exists)
    console.log('\n📋 Testing database access...');
    
    // Try to access a common table or view
    const { data: tableData, error: tableError } = await supabase
      .from('facilities')
      .select('id')
      .limit(1);
      
    if (tableError && !tableError.message.includes('relation "facilities" does not exist')) {
      console.error('❌ Database access error:', tableError.message);
      process.exit(1);
    }
    
    console.log('✅ Database access working (facilities table accessible or doesn\'t exist yet)');
    
    console.log('\n🎉 All tests passed! Application is properly configured for Supabase Cloud.');
    console.log(`🌍 Connected to: ${new URL(supabaseUrl).hostname}`);
    
  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error.message);
    process.exit(1);
  }
}

// Run the test
testConnection();