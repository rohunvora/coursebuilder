#!/bin/bash

# Course Builder Packaging Script
# Creates clean distribution packages

set -e

VERSION="1.2.0"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "📦 Course Builder Packaging Script"
echo "================================="

# Ensure we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run from project root"
    exit 1
fi

# Create temp directory
TEMP_DIR=".tmp/package-${TIMESTAMP}"
mkdir -p .tmp
mkdir -p "$TEMP_DIR"

echo "🧹 Cleaning build artifacts..."
rm -rf .next .cache dist/*.zip

echo "🔨 Building production bundle..."
npm run build

echo "📋 Preparing package contents..."

# Package 1: Source code only (for developers)
echo "📦 Creating source package..."
SOURCE_PKG="dist/coursebuilder-source-v${VERSION}.zip"
zip -r "$SOURCE_PKG" \
    src \
    prisma \
    docs \
    config \
    scripts \
    package.json \
    README.md \
    .env.example \
    -x "*.DS_Store" "*/node_modules/*" "*/.next/*"

# Package 2: Standalone demos (for testing)
echo "📦 Creating standalone package..."
STANDALONE_PKG="dist/coursebuilder-standalone-v${VERSION}.zip"
zip -r "$STANDALONE_PKG" \
    demos \
    tests/utils/test-api-server.js \
    tests/utils/test-scripts.sh \
    docs/RUN-WITHOUT-NPM.md \
    -x "*.DS_Store"

# Package 3: Production build (with .next)
echo "📦 Creating production package..."
cp -r .next "$TEMP_DIR/"
cp -r src "$TEMP_DIR/"
cp -r prisma "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp -r config "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp .env.example "$TEMP_DIR/"

# Create start script for production
cat > "$TEMP_DIR/start-production.sh" << 'EOF'
#!/bin/bash
echo "Starting Course Builder in production mode..."
echo "Make sure to:"
echo "1. Copy .env.example to .env and add your OpenAI key"
echo "2. Run: npm install --production"
echo "3. Run: npx prisma generate && npx prisma db push"
echo "4. Run: npm start"
EOF
chmod +x "$TEMP_DIR/start-production.sh"

PROD_PKG="dist/coursebuilder-production-v${VERSION}.zip"
cd "$TEMP_DIR"
zip -r "../../$PROD_PKG" . -x "*.DS_Store"
cd ../..

# Package 4: Complete distribution (everything)
echo "📦 Creating complete package..."
COMPLETE_PKG="dist/coursebuilder-complete-v${VERSION}.zip"
zip -r "$COMPLETE_PKG" \
    src \
    prisma \
    docs \
    demos \
    tests \
    scripts \
    config \
    package.json \
    README.md \
    DIRECTORY-MAP.md \
    .env.example \
    -x "*.DS_Store" "*/node_modules/*" "*/.next/*" "*/.cache/*"

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Packaging complete!"
echo ""
echo "📦 Created packages:"
echo "  1. $SOURCE_PKG ($(du -h "$SOURCE_PKG" | cut -f1))"
echo "     → Source code for developers"
echo ""
echo "  2. $STANDALONE_PKG ($(du -h "$STANDALONE_PKG" | cut -f1))"
echo "     → Standalone demos for testing without npm"
echo ""
echo "  3. $PROD_PKG ($(du -h "$PROD_PKG" | cut -f1))"
echo "     → Production-ready build"
echo ""
echo "  4. $COMPLETE_PKG ($(du -h "$COMPLETE_PKG" | cut -f1))"
echo "     → Complete distribution with everything"
echo ""
echo "📋 Distribution Guide:"
echo "  - For testing: Use standalone package"
echo "  - For deployment: Use production package"
echo "  - For development: Use source or complete package"