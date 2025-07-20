#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Course Builder database...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found!');
  console.log('📝 Please create .env.local based on .env.local.example');
  console.log('   and add your Supabase connection details.\n');
  process.exit(1);
}

// Check if DATABASE_URL is set
require('dotenv').config({ path: envPath });
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env.local!');
  console.log('📝 Please add your Supabase connection URL to .env.local\n');
  process.exit(1);
}

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to database
  console.log('\n🔄 Pushing schema to Supabase...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Seed achievements if requested
  if (process.argv.includes('--seed')) {
    console.log('\n🌱 Seeding achievements...');
    execSync('npm run seed-achievements', { stdio: 'inherit' });
  }
  
  console.log('\n✅ Database setup complete!');
  console.log('🎯 Your Supabase database is ready to use.\n');
  
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}