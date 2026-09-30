#!/usr/bin/env node

/**
 * Admin seed script — creates the initial admin user.
 *
 * Usage:
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=strongpassword123 npm run seed:admin
 *
 * Environment variables:
 *   ADMIN_USERNAME  — username (default: admin)
 *   ADMIN_PASSWORD  — required, minimum 8 characters
 *   ADMIN_FULLNAME  — optional display name
 *   MONGODB_URI     — MongoDB connection string (from .env)
 */

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const User = require('../models/User');

async function seedAdmin() {
 const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
 const password = process.env.ADMIN_PASSWORD;
 const fullName = process.env.ADMIN_FULLNAME || '';

 if (!password || password.length < 8) {
  console.error('Error: ADMIN_PASSWORD environment variable is required and must be at least 8 characters.');
  console.error('Usage: ADMIN_USERNAME=admin ADMIN_PASSWORD=yourpassword npm run seed:admin');
  process.exit(1);
 }

 await connectDatabase();

 const existing = await User.findOne({ username });
 if (existing) {
  console.log(`Admin user "${username}" already exists. Updating password.`);
  existing.passwordHash = await User.hashPassword(password);
  if (fullName) existing.fullName = fullName;
  existing.isActive = true;
  await existing.save();
  console.log(`Admin user "${username}" password updated successfully.`);
 } else {
  const passwordHash = await User.hashPassword(password);
  await User.create({
   username,
   passwordHash,
   fullName: fullName || undefined,
   role: 'admin',
  });
  console.log(`Admin user "${username}" created successfully.`);
 }

 await mongoose.disconnect();
}

seedAdmin().catch((error) => {
 console.error('Seed failed:', error.message);
 process.exit(1);
});
