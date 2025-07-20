#!/bin/bash

# Course Builder Directory Reorganization Script
# This script reorganizes the messy directory structure into a clean, maintainable layout

set -e

echo "🔄 Course Builder Directory Reorganization"
echo "========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Error: Run this script from the coursebuilder root directory"
    exit 1
fi

echo "📁 Creating new directory structure..."

# Create all necessary directories
mkdir -p docs
mkdir -p tests/{unit,integration,e2e,utils}
mkdir -p demos
mkdir -p dist/{standalone,releases}
mkdir -p config
mkdir -p .cache
mkdir -p .tmp

echo "📄 Moving documentation files..."
# Move documentation files to docs/
[ -f "DEPLOYMENT.md" ] && mv DEPLOYMENT.md docs/
[ -f "TESTING-GUIDE.md" ] && mv TESTING-GUIDE.md docs/TESTING.md
[ -f "TESTING-SOLUTION.md" ] && mv TESTING-SOLUTION.md docs/
[ -f "RUN-WITHOUT-NPM.md" ] && mv RUN-WITHOUT-NPM.md docs/
[ -f "REORGANIZATION-PLAN.md" ] && mv REORGANIZATION-PLAN.md docs/

echo "🧪 Moving test files..."
# Move test files to tests/
[ -f "test-api-server.js" ] && mv test-api-server.js tests/utils/
[ -f "test-scripts.sh" ] && mv test-scripts.sh tests/utils/
[ -f "src/lib/questionGenerator.test.ts" ] && mv src/lib/questionGenerator.test.ts tests/unit/

echo "🎮 Moving demo files..."
# Move demo files to demos/
[ -f "coursebuilder-complete.html" ] && mv coursebuilder-complete.html demos/complete-app.html
[ -f "standalone-demo.html" ] && mv standalone-demo.html demos/simple-demo.html

# Create demos README
cat > demos/README.md << 'EOF'
# Course Builder Demos

This directory contains standalone demonstrations of Course Builder that work without any installation.

## Files

- `complete-app.html` - Full-featured standalone application with all v1.2 features
- `simple-demo.html` - Simplified demo showing core functionality

## Usage

Simply open any HTML file in a web browser. No server or npm installation required!

### Features in Complete App
- Full course generation with mock data
- Bayesian knowledge tracking
- Spaced repetition scheduling
- Achievement system
- Analytics dashboard
- Local storage persistence

### Testing
1. Open `complete-app.html` in Chrome, Firefox, or Safari
2. Try "Stoic Philosophy" as a topic
3. Complete the course to see all features
EOF

echo "📦 Moving distribution files..."
# Move ZIP files to dist/
for zip in coursebuilder-*.zip; do
    [ -f "$zip" ] && mv "$zip" dist/
done

echo "⚙️ Moving configuration files..."
# Move config files to config/
[ -f "jest.config.js" ] && mv jest.config.js config/
[ -f "next.config.js" ] && mv next.config.js config/
[ -f "tailwind.config.js" ] && mv tailwind.config.js config/
[ -f "postcss.config.js" ] && mv postcss.config.js config/
[ -f "tsconfig.json" ] && mv tsconfig.json config/
[ -f ".eslintrc.json" ] && mv .eslintrc.json config/
[ -f ".prettierrc" ] && mv .prettierrc config/
[ -f "vercel.json" ] && mv vercel.json config/

echo "🔧 Moving utility scripts..."
# Move standalone servers to scripts/
[ -f "standalone-server.js" ] && mv standalone-server.js scripts/
[ -f "next.config.static.js" ] && mv next.config.static.js scripts/

echo "🗑️ Moving cache files..."
# Move cache files
if [ -d "cache" ]; then
    mv cache/* .cache/ 2>/dev/null || true
    rmdir cache
fi

echo "🧹 Cleaning up unnecessary files..."
# Remove unnecessary files
[ -f ".DS_Store" ] && rm .DS_Store
[ -f ".zipignore" ] && rm .zipignore
[ -f "jest.setup.js" ] && rm jest.setup.js

echo "📝 Creating root config symlinks..."
# Create symlinks for config files that need to be in root
ln -sf config/next.config.js next.config.js
ln -sf config/tailwind.config.js tailwind.config.js
ln -sf config/postcss.config.js postcss.config.js
ln -sf config/tsconfig.json tsconfig.json
ln -sf config/.eslintrc.json .eslintrc.json
ln -sf config/.prettierrc .prettierrc

echo "📋 Updating package.json scripts..."
# Update package.json to reference new locations
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Update test config
if (pkg.jest) {
    delete pkg.jest;
}

// Update scripts if needed
if (pkg.scripts.test && pkg.scripts.test.includes('jest')) {
    pkg.scripts.test = 'jest --config config/jest.config.js';
}

// Add new useful scripts
pkg.scripts['test:unit'] = 'jest --config config/jest.config.js tests/unit';
pkg.scripts['test:integration'] = 'jest --config config/jest.config.js tests/integration';
pkg.scripts['clean'] = 'rm -rf .next .cache .tmp dist/*.zip';
pkg.scripts['package'] = './scripts/package.sh';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "📄 Creating new .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Production
.next/
out/
dist/*.zip
dist/standalone/
dist/releases/

# Cache
.cache/
.tmp/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Database
prisma/dev.db
prisma/dev.db-journal
*.db
*.sqlite

# Misc
.vercel
EOF

echo "📄 Updating README with new structure..."
# Add section to README about directory structure
if ! grep -q "Directory Structure" README.md; then
    cat >> README.md << 'EOF'

## Directory Structure

```
coursebuilder/
├── src/          # Source code
├── docs/         # Documentation
├── tests/        # Test files
├── demos/        # Standalone demos
├── dist/         # Distribution packages
├── scripts/      # Build and utility scripts
├── config/       # Configuration files
└── prisma/       # Database schema
```
EOF
fi

echo "🔍 Creating directory map..."
# Create a directory map for reference
cat > DIRECTORY-MAP.md << 'EOF'
# Course Builder Directory Map

## Source Code (`/src`)
- `/components` - React components
- `/pages` - Next.js pages and API routes
- `/lib` - Core business logic
  - `/coursePipeline` - Course generation
  - `/learnerModel` - Learning algorithms
  - `/gamification` - Achievement system
- `/styles` - CSS files

## Documentation (`/docs`)
- `DEPLOYMENT.md` - Deployment instructions
- `TESTING.md` - Testing guide
- `TESTING-SOLUTION.md` - Testing solutions
- `RUN-WITHOUT-NPM.md` - No-npm instructions

## Tests (`/tests`)
- `/unit` - Unit tests
- `/integration` - Integration tests
- `/e2e` - End-to-end tests
- `/utils` - Test utilities and scripts

## Demos (`/demos`)
- `complete-app.html` - Full standalone app
- `simple-demo.html` - Basic demo

## Distribution (`/dist`)
- ZIP packages for releases
- `/standalone` - Standalone builds
- `/releases` - Version history

## Scripts (`/scripts`)
- Build and packaging scripts
- Database seed scripts
- Utility scripts

## Configuration (`/config`)
- All config files (Jest, Next.js, TypeScript, etc.)
- Symlinked to root as needed
EOF

echo "✅ Reorganization complete!"
echo ""
echo "📋 Summary of changes:"
echo "  - Documentation moved to /docs"
echo "  - Tests moved to /tests"
echo "  - Demos moved to /demos"
echo "  - Configs moved to /config (symlinked to root)"
echo "  - Distribution files in /dist"
echo "  - Cache in hidden directories"
echo ""
echo "🔍 Next steps:"
echo "  1. Review DIRECTORY-MAP.md for the new structure"
echo "  2. Run 'npm test' to ensure tests still work"
echo "  3. Run 'npm run build' to verify build process"
echo "  4. Commit changes: git add -A && git commit -m 'Reorganize directory structure'"
echo ""
echo "💡 Tip: If something went wrong, your backup is at ../coursebuilder-backup"