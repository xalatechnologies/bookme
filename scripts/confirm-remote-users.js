/**
 * Confirm Remote Users Script
 *
 * Confirms all test users on remote Supabase instance using Management API
 * Run with: node scripts/confirm-remote-users.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const PROJECT_REF = "pfkggenadjqrzrtdghrr";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("❌ Missing SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

const TEST_USER_EMAILS = [
  "test.user@drammen.kommune.no",
  "staff@drammen.kommune.no",
  "admin@drammen.kommune.no",
  "owner@drammen.kommune.no",
  "superadmin@booknor.no",
];

async function confirmRemoteUsers() {
  console.log("🔧 Confirming test users on remote Supabase...\n");

  let successCount = 0;
  let errorCount = 0;

  // Get all users first
  console.log("📡 Fetching users from remote...");
  const listResponse = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/auth/users`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!listResponse.ok) {
    console.error(`❌ Failed to fetch users: ${listResponse.statusText}`);
    process.exit(1);
  }

  const usersData = await listResponse.json();
  const users = usersData.users || [];

  console.log(`✅ Found ${users.length} users\n`);

  for (const email of TEST_USER_EMAILS) {
    const user = users.find((u) => u.email === email);

    if (!user) {
      console.log(`⚠️  User not found: ${email}`);
      errorCount++;
      continue;
    }

    console.log(`🔄 Confirming: ${email}`);
    console.log(`   User ID: ${user.id}`);

    try {
      // Update user to confirm email
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/auth/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_confirm: true,
            ban_duration: "none",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `   ❌ Error: ${errorData.message || response.statusText}`
        );
        errorCount++;
        continue;
      }

      const updatedUser = await response.json();
      console.log(`   ✅ User confirmed successfully!`);

      if (updatedUser.email_confirmed_at) {
        console.log(`   📧 Confirmed at: ${updatedUser.email_confirmed_at}`);
      }

      successCount++;
      console.log("");
    } catch (err) {
      console.error(`   ❌ Unexpected error: ${err.message}`);
      errorCount++;
      console.log("");
    }
  }

  console.log("=".repeat(60));
  console.log("📊 Summary:");
  console.log(`  ✅ Confirmed: ${successCount}/${TEST_USER_EMAILS.length}`);
  console.log(`  ❌ Errors: ${errorCount}/${TEST_USER_EMAILS.length}`);
  console.log("=".repeat(60) + "\n");

  if (successCount > 0) {
    console.log("✅ Users confirmed successfully!\n");
    console.log("📝 You can now log in with:");
    console.log("  Email: test.user@drammen.kommune.no");
    console.log("  Password: Test123!\n");
  } else {
    console.log("❌ No users were confirmed. Please check the errors above.\n");
  }
}

confirmRemoteUsers().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
