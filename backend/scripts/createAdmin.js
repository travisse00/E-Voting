// Standalone script for creating admin accounts. Not exposed as an API route
// on purpose, so random people can't sign themselves up as admins.
//
// Usage:
//   cd backend
//   node scripts/createAdmin.js

require("dotenv").config();
const readline = require("readline");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function main() {
  console.log("=== Create a new admin ===\n");

  const username = (await ask("Username: ")).trim();
  const email = (await ask("Email: ")).trim().toLowerCase();
  const password = await ask("Password (min 8 characters): ");
  const roleInput = (await ask("Role [admin/superadmin] (default: admin): ")).trim().toLowerCase();
  const role = roleInput === "superadmin" ? "superadmin" : "admin";

  rl.close();

  if (!username || !email || !password) {
    console.error("\nUsername, email and password are all required. Aborting.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("\nPassword must be at least 8 characters. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.error(`\nAn admin with email "${email}" already exists. Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ username, email, passwordHash, role });

  console.log(`\nAdmin created: ${admin.username} <${admin.email}> [${admin.role}]`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("\nFailed to create admin:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
