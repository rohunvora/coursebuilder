# Course Builder v1.2 - Learning Science Edition

AI-powered micro-learning platform that transforms any topic into a gamified, Duolingo-style course.

## What's New in v1.2

### 🧠 Learning Science Integration
- **Bayesian Knowledge Tracking**: Scientifically models your understanding of each skill
- **Spaced Repetition**: Optimal review scheduling based on SuperMemo 2 algorithm
- **Confidence Calibration**: Rate your confidence before seeing if you're correct
- **Forgetting Curve Modeling**: Predicts when you'll forget and schedules reviews accordingly

### 📊 Advanced Analytics
- **Learning Dashboard**: Visualize your progress with interactive charts
- **Skill Mastery Tracking**: See your knowledge probability for each skill
- **Bloom's Taxonomy Progress**: Track advancement through cognitive levels
- **Time Distribution Analysis**: Understand when you learn best

### 🏆 Gamification 2.0
- **Achievement System**: Unlock 12+ achievements across 5 categories
- **Daily Streak Tracking**: Build consistent learning habits
- **XP Leaderboard Ready**: Foundation for social learning features
- **Mastery Levels**: Progress from Novice → Expert for each skill

### 🔄 Review Mode
- **Smart Review Sessions**: AI prioritizes what you're about to forget
- **Adaptive Difficulty**: Questions get harder/easier based on performance
- **Response Time Analysis**: Faster correct answers increase retention estimates
- **Cross-Course Reviews**: Review skills from all your courses in one session

### 🏗️ Architecture Improvements
- **Modular Pipeline**: Inspired by academic prototypes with clean separation
- **SQLite Database**: Persistent storage for all learning data
- **Prisma ORM**: Type-safe database queries
- **Production Ready**: Deployable to Vercel with one click

## Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Acceptance Test

1. Build a course on "Stoic philosophy"
2. Verify:
   - 7 cards with rising Bloom's taxonomy levels
   - Plausible distractors (no nonsense answers)
   - Critic scores ≥8 logged in console
   - XP bar animations and confetti on completion
   - Course loads instantly on refresh (cached)
3. Test rate limiting: Two rapid requests → second returns 429
4. Run Lighthouse audit → Score ≥90

## Features

### Core Learning Experience
- **7 Micro-Skills Per Course**: Each with targeted learning objectives
- **Progressive Difficulty**: Questions advance through Bloom's taxonomy levels
- **Instant Feedback**: Explanations reveal why answers are correct
- **XP System**: Earn 10 XP per correct answer with visual progress tracking

### User Interface
- **Responsive Design**: Mobile-first with gradient aesthetics
- **Smooth Animations**: Framer Motion for delightful interactions
- **Accessibility**: Keyboard navigation and ARIA labels
- **Toast Notifications**: Non-intrusive feedback messages

### Technical Features
- **OpenAI GPT-4o Integration**: Advanced question generation with critic validation
- **Persistent Caching**: JSON file storage reduces API calls
- **Rate Limiting**: Prevents abuse with per-IP restrictions
- **TypeScript**: Full type safety throughout the codebase

## Architecture

```
src/
├── pages/              # Next.js pages
│   ├── index.tsx       # Landing page with examples
│   ├── course/         # Dynamic course routes
│   └── api/            # Backend endpoints
├── components/         # React components
│   ├── QuizCard.tsx    # Interactive question cards
│   ├── XPBar.tsx       # Progress visualization
│   └── CompletionModal.tsx # Course completion celebration
├── lib/                # Core logic
│   ├── questionGenerator.ts # Bloom's taxonomy implementation
│   ├── cache.ts        # File-based caching system
│   └── env.ts          # Environment validation
└── styles/             # Global styles with Tailwind
```

## API Endpoints

### POST /api/generate
Generate a new course for the given topic.
- Rate limited: 1 request/minute per IP
- Caches results by topic hash
- Returns: `{ courseId: string }`

### GET /api/course/[courseId]
Retrieve course data by ID.
- Returns full course structure with questions

### POST /api/feedback
Submit user feedback for quality improvement.
- Tracks thumbs up/down with optional comments
- Logs to console (ready for future ML pipeline)

## Development

### Run Tests
```bash
npm test
```

### Format Code
```bash
npm run format
```

### Build for Production
```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom gradients
- **AI**: OpenAI GPT-4o with function calling
- **Animation**: Framer Motion
- **Notifications**: React Hot Toast
- **Tour**: React Joyride
- **Confetti**: Canvas Confetti
- **IDs**: Nanoid

## v1.1 Features (Preserved)

- **Enhanced Question Quality**: Bloom's taxonomy, plausible distractors, critic validation
- **Polished UX**: Beautiful landing, smooth animations, keyboard navigation
- **Smart Engineering**: Nanoid IDs, caching, rate limiting

## Architecture

```
src/
├── pages/              # Next.js pages
│   ├── index.tsx       # Landing page
│   ├── dashboard.tsx   # Learning analytics
│   ├── review.tsx      # Spaced repetition
│   └── api/            # Backend endpoints
├── components/         # React components
│   ├── QuizCard.tsx    # With confidence rating
│   ├── AnalyticsDashboard.tsx # Charts & insights
│   └── CompletionModal.tsx
├── lib/                # Core logic
│   ├── coursePipeline/ # Modular generation
│   │   ├── goalParser.ts
│   │   └── curriculumPlanner.ts
│   ├── learnerModel/   # Learning science
│   │   ├── knowledgeTracker.ts # Bayesian
│   │   └── spacedRepetition.ts # SM2
│   └── gamification/   # Engagement
│       ├── achievements.ts
│       └── streaks.ts
└── prisma/             # Database schema
```

## Deployment

### Deploy to Vercel

1. Fork this repository
2. Create a new project on Vercel
3. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DATABASE_URL`: SQLite connection string
4. Deploy!

### Local Development

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## Learning Science References

- **Bayesian Knowledge Tracing**: Corbett & Anderson (1994)
- **SuperMemo 2 Algorithm**: Wozniak (1990)
- **Forgetting Curve**: Ebbinghaus (1885)
- **Bloom's Taxonomy**: Bloom et al. (1956)

## License

MIT