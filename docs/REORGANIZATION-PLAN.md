# Course Builder v1.2 - Directory Reorganization Plan

## 🎯 Goal
Transform the messy flat structure into a clean, intuitive organization that separates concerns and makes the project maintainable.

## 📁 Proposed Directory Structure

```
coursebuilder/
│
├── 📄 README.md                    # Main project documentation
├── 📄 package.json                 # Node.js dependencies
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Environment variables template
│
├── 📁 src/                         # Source code (unchanged)
│   ├── components/                 # React components
│   ├── pages/                      # Next.js pages
│   ├── lib/                        # Core business logic
│   └── styles/                     # CSS styles
│
├── 📁 docs/                        # All documentation
│   ├── DEPLOYMENT.md               # How to deploy
│   ├── TESTING.md                  # Testing guide
│   ├── API.md                      # API documentation
│   ├── ARCHITECTURE.md             # System design
│   └── LEARNING-SCIENCE.md         # Algorithm explanations
│
├── 📁 tests/                       # All test files
│   ├── unit/                       # Unit tests
│   │   └── questionGenerator.test.ts
│   ├── integration/                # Integration tests
│   ├── e2e/                        # End-to-end tests
│   └── utils/                      # Test utilities
│       ├── test-api-server.js      # API test server
│       └── test-scripts.sh         # Test automation
│
├── 📁 demos/                       # Standalone demos
│   ├── complete-app.html           # Full standalone HTML
│   ├── simple-demo.html            # Basic demo
│   └── README.md                   # Demo instructions
│
├── 📁 dist/                        # Distribution files
│   ├── coursebuilder-v1.2.zip      # Release package
│   ├── standalone/                 # Standalone builds
│   └── releases/                   # Version history
│
├── 📁 scripts/                     # Build & utility scripts
│   ├── build.sh                    # Build script
│   ├── package.sh                  # Package for distribution
│   ├── clean.sh                    # Cleanup script
│   └── seed-achievements.js        # Database seeding
│
├── 📁 config/                      # Configuration files
│   ├── jest.config.js              # Jest testing config
│   ├── next.config.js              # Next.js config
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── tsconfig.json               # TypeScript config
│   ├── .eslintrc.json              # ESLint rules
│   ├── .prettierrc                 # Prettier formatting
│   └── vercel.json                 # Vercel deployment
│
├── 📁 prisma/                      # Database schema
│   └── schema.prisma               # Prisma schema
│
├── 📁 .next/                       # Next.js build output (git ignored)
├── 📁 node_modules/                # Dependencies (git ignored)
├── 📁 .cache/                      # Cache files (git ignored)
└── 📁 .tmp/                        # Temporary files (git ignored)
```

## 🔧 Migration Commands

```bash
# 1. Create new directory structure
mkdir -p docs tests/{unit,integration,e2e,utils} demos dist/{standalone,releases} config .cache .tmp

# 2. Move documentation files
mv DEPLOYMENT.md TESTING-GUIDE.md TESTING-SOLUTION.md RUN-WITHOUT-NPM.md docs/

# 3. Move test files
mv test-api-server.js test-scripts.sh tests/utils/
mv src/lib/questionGenerator.test.ts tests/unit/

# 4. Move demo files
mv coursebuilder-complete.html demos/complete-app.html
mv standalone-demo.html demos/simple-demo.html

# 5. Move distribution files
mv coursebuilder-*.zip dist/

# 6. Move config files
mv jest.config.js next.config.js tailwind.config.js postcss.config.js tsconfig.json .eslintrc.json .prettierrc vercel.json config/

# 7. Move standalone servers
mv standalone-server.js next.config.static.js scripts/

# 8. Move cache files
mv cache/* .cache/ 2>/dev/null || true
rmdir cache

# 9. Clean up
rm .DS_Store .zipignore jest.setup.js
```

## 📝 Updated .gitignore

```gitignore
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

# Environment
.env
.env.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
prisma/dev.db
prisma/dev.db-journal
```

## 🎨 Benefits of New Structure

### 1. **Clear Separation of Concerns**
- Source code in `src/`
- Tests in `tests/`
- Documentation in `docs/`
- Configuration in `config/`

### 2. **Easy Navigation**
- Developers know exactly where to find things
- New team members can onboard quickly
- Clear distinction between dev and production files

### 3. **Better Build Process**
- `dist/` contains only production-ready files
- `.cache/` and `.tmp/` for build artifacts
- Scripts organized in `scripts/`

### 4. **Improved Testing**
- All tests in one place
- Separated by type (unit, integration, e2e)
- Test utilities clearly organized

### 5. **Clean Root Directory**
- Only essential files at root level
- Configuration files grouped together
- No clutter from various experiments

## 🚀 Implementation Steps

1. **Backup Current State**
   ```bash
   cp -r . ../coursebuilder-backup
   ```

2. **Run Migration Script**
   ```bash
   chmod +x scripts/reorganize.sh
   ./scripts/reorganize.sh
   ```

3. **Update Import Paths**
   - Update relative imports in moved files
   - Update script references in package.json
   - Update documentation links

4. **Test Everything**
   ```bash
   npm test
   npm run build
   ```

5. **Commit Changes**
   ```bash
   git add -A
   git commit -m "Reorganize directory structure for better maintainability"
   ```

## 📋 Checklist After Reorganization

- [ ] All tests pass
- [ ] Build process works
- [ ] Documentation links updated
- [ ] README reflects new structure
- [ ] CI/CD pipelines updated
- [ ] No broken imports
- [ ] Git history preserved
- [ ] Team notified of changes

This organization will make the project much more maintainable and professional! 🎉