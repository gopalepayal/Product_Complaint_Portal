/**
 * One-time admin password reset script.
 * Run: node scripts/reset-admin-password.mjs
 * Password is entered interactively — never stored in code or command history.
 */

import { createInterface } from "readline";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer); });
  });
}

async function main() {
  console.log("\n=== Product Complaint Portal — Admin Password Reset ===\n");

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true, legalName: true },
  });

  if (!admin) {
    console.error("No ADMIN account found in the database.");
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Admin account: ${admin.legalName} (${admin.email})\n`);

  const newPassword = await ask("Enter new password (min 8 chars): ");
  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters. No changes made.");
    await prisma.$disconnect();
    process.exit(1);
  }

  const confirm = await ask("Confirm new password: ");
  if (newPassword !== confirm) {
    console.error("Passwords do not match. No changes made.");
    await prisma.$disconnect();
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash: hash } });
  await prisma.$disconnect();

  console.log("\nAdmin password has been successfully updated.");
  console.log("Log in at http://localhost:3001/admin/login\n");
}

main().catch(async (e) => {
  console.error("Error:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
