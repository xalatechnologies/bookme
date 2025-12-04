/**
 * Setup Remote Test Users Script
 *
 * Creates test users on remote Supabase instance
 * Run with: node scripts/setup-remote-users.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase configuration in .env.local");
  console.error(
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
  );
  process.exit(1);
}

const TEST_USERS = [
  {
    email: "test.user@drammen.kommune.no",
    password: "Test123!",
    displayName: "Test Bruker",
  },
  {
    email: "staff@drammen.kommune.no",
    password: "Test123!",
    displayName: "Staff Member",
  },
  {
    email: "admin@drammen.kommune.no",
    password: "Test123!",
    displayName: "Admin User",
  },
  {
    email: "owner@drammen.kommune.no",
    password: "Test123!",
    displayName: "Owner User",
  },
  {
    email: "superadmin@booknor.no",
    password: "Test123!",
    displayName: "Super Admin",
  },
];

async function setupRemoteUsers() {
  console.log("🔧 Setting up test users on remote Supabase...");
  console.log(`📍 URL: ${SUPABASE_URL}\n`);

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let successCount = 0;
  let errorCount = 0;

  for (const userConfig of TEST_USERS) {
    console.log(`🔄 Creating user: ${userConfig.email}`);

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: userConfig.email,
        password: userConfig.password,
        options: {
          data: {
            display_name: userConfig.displayName,
          },
          emailRedirectTo: undefined, // Prevent email confirmation redirect
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          console.log(`  ⚠️  User already exists: ${userConfig.email}`);
          console.log(`  ℹ️  You can log in with this account\n`);
          successCount++;
        } else {
          console.error(`  ❌ Error: ${error.message}\n`);
          errorCount++;
        }
        continue;
      }

      if (data.user) {
        console.log(`  ✅ User created successfully!`);
        console.log(`  📧 User ID: ${data.user.id}`);

        if (data.user.confirmed_at) {
          console.log(`  ✅ Email confirmed automatically\n`);
        } else {
          console.log(`  ⚠️  Email confirmation may be required`);
          console.log(
            `  ℹ️  Check Supabase dashboard to confirm user manually\n`
          );
        }
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Unexpected error: ${err.message}\n`);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary:");
  console.log(`  ✅ Success: ${successCount}/${TEST_USERS.length}`);
  console.log(`  ❌ Errors: ${errorCount}/${TEST_USERS.length}`);
  console.log("=".repeat(60) + "\n");

  if (successCount > 0) {
    console.log("✅ Setup complete!\n");
    console.log("📝 Test Credentials:");
    console.log("  Email: test.user@drammen.kommune.no");
    console.log("  Password: Test123!\n");
    console.log("⚠️  IMPORTANT:");
    console.log("  1. Go to Supabase Dashboard > Authentication > Users");
    console.log("  2. Manually confirm each user if needed");
    console.log("  3. Or disable email confirmation in project settings\n");
  } else {
    console.log("❌ No users were created. Please check the errors above.\n");
  }
}

setupRemoteUsers().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
