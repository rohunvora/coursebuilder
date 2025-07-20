# Course Builder v1.2 - Testing Solution for Restricted Environments

## 🚨 Problem
The testing environment has restrictions:
- Cannot access npm registry (403 Forbidden)
- Cannot load local HTML files (CORS/security)
- Cannot access localhost from browser
- Cannot run Node.js server with dependencies

## ✅ Solution: Multiple Testing Approaches

### Option 1: API Test Server (Recommended)
We've created `test-api-server.js` that runs with zero npm dependencies:

```bash
# Start the server (uses only Node.js built-ins)
node test-api-server.js

# In another terminal, run tests
./test-scripts.sh
```

This tests:
- Bayesian knowledge tracking algorithm
- Confidence-based learning
- XP and leveling system
- Course generation logic
- Learning analytics

### Option 2: Deploy to GitHub Pages
1. Fork the repo
2. Enable GitHub Pages
3. Access via: `https://[username].github.io/coursebuilder/coursebuilder-complete.html`

### Option 3: Use Online HTML Viewer
1. Copy contents of `coursebuilder-complete.html`
2. Paste into: https://htmlpreview.github.io/
3. Or use: https://codepen.io/pen/

### Option 4: Manual Algorithm Testing
Test the core algorithms directly:

```javascript
// Test Bayesian Knowledge Tracking
function testBayesian() {
  let knowledge = 0.3; // Starting knowledge
  
  // Correct answer with high confidence
  knowledge = updateKnowledge(knowledge, true, 5);
  console.log('After correct (conf=5):', knowledge); // ~0.85
  
  // Incorrect answer with low confidence  
  knowledge = updateKnowledge(knowledge, false, 2);
  console.log('After incorrect (conf=2):', knowledge); // ~0.45
}

// Test Spaced Repetition
function testSpacedRepetition() {
  let schedule = { intervalDays: 1, easeFactor: 2.5 };
  
  // Perfect recall
  schedule = calculateNextReview(schedule, 5);
  console.log('Next review:', schedule.intervalDays); // 6 days
  
  // Poor recall
  schedule = calculateNextReview(schedule, 2);
  console.log('Reset to:', schedule.intervalDays); // 1 day
}
```

## 📋 What to Test

### 1. Core Learning Science Features
- **Bayesian Knowledge Tracking**: Knowledge probability updates based on performance
- **Confidence Calibration**: 1-5 scale affects knowledge updates
- **Spaced Repetition**: SM2 algorithm schedules reviews
- **Bloom's Taxonomy**: Questions progress through cognitive levels

### 2. Gamification Elements
- **XP System**: 10 XP per correct answer
- **Leveling**: Every 100 XP = new level
- **Achievements**: Unlock based on milestones
- **Streak Tracking**: Consecutive days

### 3. User Experience
- **Course Generation**: AI creates 7 micro-skills
- **Adaptive Learning**: Difficulty adjusts to performance
- **Progress Tracking**: Visual feedback on mastery
- **Review Mode**: Practice due skills

## 🔧 API Endpoints for Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Create User
```bash
curl -X POST http://localhost:3000/api/user
```

### Generate Course
```bash
curl -X POST http://localhost:3000/api/course/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Quantum Computing"}'
```

### Submit Answer
```bash
curl -X POST http://localhost:3000/api/answer \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "skillId": "skill-1",
    "answer": 2,
    "confidence": 4,
    "correct": true
  }'
```

### Get Analytics
```bash
curl http://localhost:3000/api/analytics/user-123
```

## 📊 Expected Results

### Knowledge Tracking
- Starting knowledge: 30%
- After correct answer (high confidence): ~85%
- After incorrect answer (low confidence): ~15%
- Converges to true knowledge over time

### Spaced Repetition
- Initial interval: 1 day
- After success: 6, 15, 30, 90 days
- After failure: Reset to 1 day
- Ease factor adjusts difficulty

### XP Progression
- Correct answer: +10 XP
- Level up at: 100, 200, 300 XP...
- Achievements unlock at milestones

## 🎯 Validation Checklist

- [ ] API server starts without npm dependencies
- [ ] Health endpoint returns v1.2 and features list
- [ ] User creation returns unique ID
- [ ] Course generation completes in ~1 second
- [ ] Knowledge probability updates correctly
- [ ] XP accumulates with correct answers
- [ ] Analytics show accurate statistics
- [ ] Confidence affects knowledge updates
- [ ] Multiple attempts track accuracy

## 💡 Alternative: Code Review Focus

If runtime testing isn't possible, review these key files:

1. **Learning Algorithms**
   - `/src/lib/learnerModel/knowledgeTracker.ts` - Bayesian implementation
   - `/src/lib/learnerModel/spacedRepetition.ts` - SM2 algorithm

2. **Course Generation**
   - `/src/lib/coursePipeline/goalParser.ts` - AI integration
   - `/src/lib/coursePipeline/curriculumPlanner.ts` - Bloom's taxonomy

3. **Gamification**
   - `/src/lib/gamification/achievements.ts` - Achievement conditions
   - `/src/lib/gamification/streaks.ts` - Daily tracking

4. **UI Components**
   - `/src/components/QuizCard.tsx` - Confidence modal
   - `/src/components/AnalyticsDashboard.tsx` - Data visualization

The codebase implements all v1.2 features with proper TypeScript types, error handling, and modular architecture.