# Course Builder v1.2 - Deployment Guide

## 📦 ZIP Contents

The `coursebuilder-v1.2.zip` file (54KB) contains the complete source code excluding:
- `node_modules/` (564MB) - will be installed during deployment
- `.next/` (76MB) - build artifacts
- `.git/` - version control
- `package-lock.json` - will be regenerated
- Database files and logs

## 🚀 Quick Deploy Instructions

### 1. Extract and Install

```bash
unzip coursebuilder-v1.2.zip
cd coursebuilder
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables:
# - OPENAI_API_KEY
# - DATABASE_URL (use default)
```

## 📁 Project Structure

```
coursebuilder/
├── src/
│   ├── pages/          # Next.js pages & API routes
│   ├── components/     # React components
│   └── lib/            # Core logic
│       ├── coursePipeline/   # AI course generation
│       ├── learnerModel/     # Learning science algorithms
│       └── gamification/     # Achievements & streaks
├── prisma/             # Database schema
├── scripts/            # Build scripts
└── public/             # Static assets
```

## 🔧 Key Features to Test

1. **Course Generation**: Create a course on any topic
2. **Learning Dashboard**: View analytics and progress
3. **Spaced Repetition**: Review skills at optimal intervals
4. **Achievements**: Unlock badges for milestones
5. **Confidence Rating**: Self-assess before answers
6. **Streak Tracking**: Build daily learning habits

## 📝 Notes

- The app uses SQLite for easy deployment
- All learning data persists locally
- Rate limited to 1 course generation per minute
- Supports keyboard navigation (1-4 keys for answers)

## 🆘 Troubleshooting

If you encounter issues:

1. Ensure Node.js 18+ is installed
2. Delete `node_modules` and reinstall
3. Clear `.next` build cache
4. Check OpenAI API key is valid
5. Verify SQLite database was created

For production deployment, the app is optimized for Vercel but can run on any Node.js hosting platform.