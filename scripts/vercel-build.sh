#!/bin/bash

# Course Builder - Vercel Build Script
# Handles database setup and build process

echo "🚀 Starting Course Builder build..."

# 1. Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# 2. Check database connection
echo "🗄️ Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set!"
  echo "Please set DATABASE_URL in Vercel environment variables"
  echo "See SUPABASE-SETUP.md for instructions"
  exit 1
fi

# 3. Push database schema
echo "📋 Pushing database schema to Supabase..."
npx prisma db push --skip-generate || {
  echo "❌ Database schema push failed!"
  echo "Please check your DATABASE_URL and Supabase connection"
  exit 1
}

# 4. Build Next.js
echo "🏗️ Building Next.js application..."
next build || {
  echo "❌ Next.js build failed!"
  exit 1
}

# 5. Seed achievements
echo "🏆 Seeding achievements..."
if [ -f "scripts/seed-achievements.js" ]; then
  node scripts/seed-achievements.js || {
    echo "⚠️ Achievement seeding failed, but build continues..."
  }
fi

echo "✅ Build completed successfully!"