/**
 * Setup Test Users Script
 *
 * Creates or updates test users with proper passwords
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USERS = [
  {
    email: 'test.user@drammen.kommune.no',
    password: 'Test123!',
    role: 'customer',
    displayName: 'Test Bruker',
  },
  {
    email: 'staff@drammen.kommune.no',
    password: 'Test123!',
    role: 'staff',
    displayName: 'Staff Member',
  },
  {
    email: 'admin@drammen.kommune.no',
    password: 'Test123!',
    role: 'admin',
    displayName: 'Admin User',
  },
  {
    email: 'owner@drammen.kommune.no',
    password: 'Test123!',
    role: 'owner',
    displayName: 'Owner User',
  },
  {
    email: 'superadmin@booknor.no',
    password: 'Test123!',
    role: 'platform_admin',
    displayName: 'Super Admin',
  },
];

async function setupUsers() {
  console.log('🔧 Setting up test users with proper authentication...\n');

  // Create Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Create Postgres client for direct DB access
  const pgClient = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  await pgClient.connect();

  console.log('✅ Connected to database\n');

  // Get organization ID
  const { rows: orgRows } = await pgClient.query(
    "SELECT id FROM organizations WHERE slug = 'drammen-kommune' LIMIT 1"
  );

  if (orgRows.length === 0) {
    console.error('❌ Organization not found!');
    await pgClient.end();
    return;
  }

  const orgId = orgRows[0].id;
  console.log(`📍 Using organization ID: ${orgId}\n`);

  for (const userConfig of TEST_USERS) {
    console.log(`🔄 Processing: ${userConfig.email}`);

    try {
      // Check if user exists
      const { rows: existingUsers } = await pgClient.query(
        'SELECT id FROM auth.users WHERE email = $1',
        [userConfig.email]
      );

      let userId;

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(`  ℹ️  User already exists with ID: ${userId}`);

        // Update user with admin client to set password
        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
          password: userConfig.password,
          email_confirm: true,
        });

        if (error) {
          console.error(`  ❌ Error updating user: ${error.message}`);
          continue;
        }

        console.log(`  ✅ Password updated successfully`);
      } else {
        // Create new user with admin client
        const { data, error } = await supabase.auth.admin.createUser({
          email: userConfig.email,
          password: userConfig.password,
          email_confirm: true,
          user_metadata: {
            display_name: userConfig.displayName,
          },
        });

        if (error) {
          console.error(`  ❌ Error creating user: ${error.message}`);
          continue;
        }

        userId = data.user.id;
        console.log(`  ✅ User created with ID: ${userId}`);
      }

      // Create or update profile
      await pgClient.query(
        `INSERT INTO profiles (user_id, display_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET display_name = $2, updated_at = NOW()`,
        [userId, userConfig.displayName]
      );

      console.log(`  ✅ Profile updated`);

      // Create or update membership (skip for platform admin)
      if (userConfig.role !== 'platform_admin') {
        await pgClient.query(
          `INSERT INTO memberships (user_id, org_id, role, created_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (user_id, org_id)
           DO UPDATE SET role = $3`,
          [userId, orgId, userConfig.role]
        );

        console.log(`  ✅ Membership set to: ${userConfig.role}`);
      } else {
        console.log(`  ℹ️  Skipping membership (platform admin)`);
      }

      console.log('');
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
      console.log('');
    }
  }

  await pgClient.end();

  console.log('✅ All test users configured successfully!\n');
  console.log('You can now log in with:');
  console.log('  Email: test.user@drammen.kommune.no');
  console.log('  Password: Test123!\n');
}

setupUsers().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
