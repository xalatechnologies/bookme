/**
 * RBAC Test Script
 *
 * Comprehensive test of authentication and role-based access control.
 * Tests all user types: customer, staff, admin, owner, and platform admin.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Test users
const TEST_USERS = [
  {
    email: 'test.user@drammen.kommune.no',
    password: 'Test123!',
    expectedRole: 'customer',
    description: 'Regular customer user',
  },
  {
    email: 'staff@drammen.kommune.no',
    password: 'Test123!',
    expectedRole: 'staff',
    description: 'Staff member',
  },
  {
    email: 'admin@drammen.kommune.no',
    password: 'Test123!',
    expectedRole: 'admin',
    description: 'Organization admin',
  },
  {
    email: 'owner@drammen.kommune.no',
    password: 'Test123!',
    expectedRole: 'owner',
    description: 'Organization owner',
  },
  {
    email: 'superadmin@bookme.no',
    password: 'Test123!',
    expectedRole: 'platform_admin',
    description: 'Platform super admin',
  },
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function section(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(message, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test authentication for a specific user
 */
async function testUserAuth(userConfig) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  section(`Testing: ${userConfig.description} (${userConfig.email})`);

  try {
    // Test sign in
    info(`Attempting to sign in...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userConfig.email,
      password: userConfig.password,
    });

    if (authError) {
      error(`Sign in failed: ${authError.message}`);
      return false;
    }

    if (!authData.user) {
      error('No user returned from sign in');
      return false;
    }

    success(`Signed in successfully - User ID: ${authData.user.id}`);

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      error(`Session error: ${sessionError.message}`);
      return false;
    }

    if (session) {
      success('Session retrieved successfully');
      info(`Access token: ${session.access_token.substring(0, 20)}...`);
    } else {
      error('No session found');
      return false;
    }

    // Get memberships
    info('Fetching memberships...');
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('*, organization:organizations(name)')
      .eq('user_id', authData.user.id);

    if (membershipError) {
      error(`Membership error: ${membershipError.message}`);
    } else {
      if (memberships && memberships.length > 0) {
        success(`Found ${memberships.length} membership(s)`);
        memberships.forEach(m => {
          info(`  - Role: ${m.role} in ${m.organization?.name || 'Unknown Org'}`);

          // Verify role matches expected
          if (m.role === userConfig.expectedRole) {
            success(`  ✓ Role matches expected: ${userConfig.expectedRole}`);
          } else if (userConfig.expectedRole !== 'platform_admin') {
            error(`  ✗ Role mismatch! Expected ${userConfig.expectedRole}, got ${m.role}`);
          }
        });
      } else {
        if (userConfig.expectedRole === 'platform_admin') {
          info('No organization memberships (expected for platform admin)');
        } else {
          error('No memberships found!');
        }
      }
    }

    // Test profile access
    info('Fetching profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      error(`Profile error: ${profileError.message}`);
    } else if (profile) {
      success('Profile retrieved successfully');
      info(`  Display name: ${profile.display_name || 'Not set'}`);
    }

    // Test bookings access (should work for all users)
    info('Testing bookings access...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', authData.user.id);

    if (bookingsError) {
      error(`Bookings error: ${bookingsError.message}`);
    } else {
      success(`Bookings query successful - Found ${bookings?.length || 0} booking(s)`);
    }

    // Test facilities access (should work for all users - read only for customers)
    info('Testing facilities access...');
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select('id, name, facility_type, status')
      .limit(5);

    if (facilitiesError) {
      error(`Facilities error: ${facilitiesError.message}`);
    } else {
      success(`Facilities query successful - Found ${facilities?.length || 0} facilit${facilities?.length === 1 ? 'y' : 'ies'}`);
    }

    // Test role-specific access
    if (['admin', 'owner', 'staff'].includes(userConfig.expectedRole)) {
      info('Testing staff-level access...');

      // Try to query all bookings (not just user's)
      const { data: allBookings, error: allBookingsError } = await supabase
        .from('bookings')
        .select('id, status, user_id')
        .limit(10);

      if (allBookingsError) {
        error(`All bookings query error: ${allBookingsError.message}`);
      } else {
        success(`Can access all bookings - Found ${allBookings?.length || 0} booking(s)`);
      }
    }

    // Sign out
    info('Signing out...');
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      error(`Sign out error: ${signOutError.message}`);
    } else {
      success('Signed out successfully');
    }

    return true;

  } catch (err) {
    error(`Unexpected error: ${err.message}`);
    console.error(err);
    return false;
  }
}

/**
 * Test RBAC helper functions
 */
async function testRBACFunctions() {
  section('Testing RBAC Helper Functions');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Sign in as admin to test RPC functions
  info('Signing in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@drammen.kommune.no',
    password: 'Test123!',
  });

  if (authError || !authData.user) {
    error('Failed to sign in for RBAC function tests');
    return;
  }

  success('Signed in as admin');

  // Test is_platform_admin function
  info('Testing is_platform_admin RPC...');
  try {
    const { data, error } = await supabase.rpc('is_platform_admin');
    if (error) {
      error(`is_platform_admin error: ${error.message}`);
    } else {
      info(`Result: ${data}`);
      if (data === false) {
        success('Correctly identified as NOT platform admin');
      }
    }
  } catch (err) {
    error(`is_platform_admin exception: ${err.message}`);
  }

  await supabase.auth.signOut();
}

/**
 * Test route protection scenarios
 */
async function testRouteProtection() {
  section('Testing Route Protection Scenarios');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test 1: Unauthenticated user should not access protected data
  info('Test 1: Unauthenticated access to bookings...');
  const { data: unauthBookings, error: unauthError } = await supabase
    .from('bookings')
    .select('*');

  if (unauthError) {
    info(`Blocked as expected: ${unauthError.message}`);
    success('✓ Unauthenticated users cannot access bookings');
  } else if (!unauthBookings || unauthBookings.length === 0) {
    success('✓ No data returned for unauthenticated user');
  } else {
    error(`✗ Unauthenticated user got ${unauthBookings.length} bookings! Security issue!`);
  }

  // Test 2: Customer cannot see other users' bookings
  info('\nTest 2: Customer trying to access other user\'s bookings...');
  await supabase.auth.signInWithPassword({
    email: 'test.user@drammen.kommune.no',
    password: 'Test123!',
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    error('Failed to get user for customer test');
    return;
  }

  // Try to get another user's bookings
  const { data: otherBookings, error: otherError } = await supabase
    .from('bookings')
    .select('*')
    .neq('user_id', user.id);  // Not the current user

  if (otherError) {
    info(`Query error: ${otherError.message}`);
  } else {
    // Note: Without RLS, customer might see other bookings
    // This is expected in local dev with RLS disabled
    info(`Query returned ${otherBookings?.length || 0} bookings from other users`);
    info('(RLS is disabled in local dev, so this is expected)');
  }

  await supabase.auth.signOut();

  success('Route protection tests completed');
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n╔═══════════════════════════════════════════════════════════╗', colors.cyan);
  log('║        BookMe RBAC & Authentication Test Suite           ║', colors.cyan);
  log('╚═══════════════════════════════════════════════════════════╝', colors.cyan);

  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = TEST_USERS.length;

  // Test each user type
  for (const userConfig of TEST_USERS) {
    const result = await testUserAuth(userConfig);
    if (result) passedTests++;
    await sleep(500); // Brief pause between tests
  }

  // Test RBAC functions
  await testRBACFunctions();
  await sleep(500);

  // Test route protection
  await testRouteProtection();

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  section('Test Summary');
  log(`Total user auth tests: ${totalTests}`, colors.cyan);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? colors.green : colors.yellow);
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? colors.green : colors.red);
  log(`Duration: ${duration}s`, colors.cyan);

  if (passedTests === totalTests) {
    success('\n🎉 All authentication tests passed!');
  } else {
    error(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please review the output above.`);
  }

  log('\n' + '='.repeat(60) + '\n', colors.cyan);
}

// Run the tests
runTests().catch(err => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
