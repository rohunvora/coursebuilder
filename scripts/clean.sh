#!/bin/bash

# Course Builder Clean Script
# Removes all generated files and caches

echo "🧹 Course Builder Clean Script"
echo "=============================="

echo "🗑️ Removing build artifacts..."
rm -rf .next
rm -rf out

echo "🗑️ Removing cache directories..."
rm -rf .cache
rm -rf .tmp
rm -rf cache

echo "🗑️ Removing distribution files..."
rm -f dist/*.zip
rm -rf dist/standalone/*
rm -rf dist/releases/*

echo "🗑️ Removing logs..."
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

echo "🗑️ Removing OS files..."
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

echo "🗑️ Removing editor files..."
find . -name "*.swp" -type f -delete 2>/dev/null || true
find . -name "*.swo" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true

echo "✅ Clean complete!"
echo ""
echo "💡 To remove node_modules: rm -rf node_modules"
echo "💡 To remove database: rm -f prisma/dev.db*"