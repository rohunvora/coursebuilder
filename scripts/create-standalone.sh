#!/bin/bash

echo "🔨 Creating standalone Course Builder package..."

# Create temp directory
TEMP_DIR="coursebuilder-standalone"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copy essential files
echo "📁 Copying essential files..."
cp -r .next $TEMP_DIR/
cp -r src $TEMP_DIR/
cp -r prisma $TEMP_DIR/
cp package.json $TEMP_DIR/
cp next.config.js $TEMP_DIR/
cp tailwind.config.js $TEMP_DIR/
cp postcss.config.js $TEMP_DIR/
cp tsconfig.json $TEMP_DIR/
cp .env.example $TEMP_DIR/
cp standalone-server.js $TEMP_DIR/
cp standalone-demo.html $TEMP_DIR/
cp TESTING-GUIDE.md $TEMP_DIR/
cp README.md $TEMP_DIR/

# Create minimal node_modules with only production dependencies
echo "📦 Installing production dependencies only..."
cd $TEMP_DIR
npm install --production --no-audit --no-fund --omit=dev

# Remove unnecessary files to reduce size
echo "🧹 Cleaning up to reduce size..."
find node_modules -name "*.md" -delete
find node_modules -name "*.txt" -delete
find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "example" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true

# Create start script
echo '#!/bin/bash
echo "Starting Course Builder v1.2..."
node standalone-server.js' > start.sh
chmod +x start.sh

# Create setup script
echo '#!/bin/bash
echo "Setting up Course Builder v1.2..."
echo "Creating .env file..."
cp .env.example .env
echo "Please edit .env and add your OpenAI API key"
echo ""
echo "Initializing database..."
npx prisma generate
npx prisma db push
echo "Setup complete! Run ./start.sh to start the server"' > setup.sh
chmod +x setup.sh

cd ..

# Create final zip
echo "📦 Creating final ZIP package..."
zip -r coursebuilder-standalone-v1.2.zip $TEMP_DIR -x "*.DS_Store"

# Check size
SIZE=$(ls -lh coursebuilder-standalone-v1.2.zip | awk '{print $5}')
echo "✅ Created coursebuilder-standalone-v1.2.zip ($SIZE)"

# Cleanup
rm -rf $TEMP_DIR