/**
 * Admin Seed Script
 * Run with: node scripts/seed-admin.js
 *
 * Creates the first ADMIN account securely from the backend.
 * Admin accounts cannot be created through the public registration page.
 *
 * Usage:
 *   set ADMIN_EMAIL=admin@yourportal.com
 *   set ADMIN_PASSWORD=YourStrongPassword123
 *   set ADMIN_NAME=Portal Admin
 *   node scripts/seed-admin.js
 *
 * Or on PowerShell:
 *   $env:ADMIN_EMAIL="admin@yourportal.com"; $env:ADMIN_PASSWORD="YourStrongPassword123"; $env:ADMIN_NAME="Portal Admin"; node scripts/seed-admin.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const legalName = process.env.ADMIN_NAME || "Portal Admin";

  if (!email || !password) {
    console.error("❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
    console.error('   Example: $env:ADMIN_EMAIL="admin@yourportal.com"; $env:ADMIN_PASSWORD="StrongPass123!"');
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("❌ Error: ADMIN_PASSWORD must be at least 10 characters.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") {
      console.log(`✅ Admin account already exists for: ${email}`);
    } else {
      console.error(`❌ Error: A non-admin account already exists for ${email}. Choose a different email.`);
      process.exit(1);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      legalName,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin account created successfully!");
  console.log(`   Name:  ${admin.legalName}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`   ID:    ${admin.id}`);
  console.log("\n🔐 You can now log in at: http://localhost:3000/admin/login");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
