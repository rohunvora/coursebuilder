# Course Builder v1.2 - Testing Guide

## 🚨 Solution for NPM Access Issues

Since your testing environment cannot access npm registry, we provide three solutions:

### Option 1: Standalone HTML Demo (Recommended for Testing)

Open `standalone-demo.html` in any web browser. This file:
- ✅ Requires NO npm installation
- ✅ Demonstrates core features with mock data
- ✅ Shows the complete user flow
- ✅ Works offline

**To test:**
1. Open `standalone-demo.html` in a browser
2. Click "Stoic Philosophy" example
3. Click "Start Learning"
4. Experience the course flow with confidence ratings
5. See XP accumulation and progress tracking

### Option 2: Pre-Built Bundle (Coming in separate ZIP)

Due to 25MB limit, we'll need to create a separate bundle with:
- Pre-installed node_modules (minified)
- Pre-built .next directory
- Ready-to-run server

### Option 3: Docker Container (If available)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 User Flow to Test

### 1. Landing Page
- **Test**: Enter "Stoic Philosophy" in the input
- **Verify**: Loading animation appears (3 seconds)
- **Check**: Examples carousel works

### 2. Course Generation
- **Verify**: 7 micro-skills generated
- **Check**: Bloom's taxonomy progression (Remember → Evaluate)
- **Test**: Question quality (plausible distractors)

### 3. Quiz Interaction
- **Test**: Confidence modal appears before answer
- **Verify**: Keyboard navigation (keys 1-4)
- **Check**: Correct/incorrect feedback with explanations
- **Test**: XP bar animation (+10 per correct answer)

### 4. Learning Dashboard
- **Navigate**: Click "Go to Dashboard" from landing
- **Verify**: Analytics charts render
- **Check**: Streak tracking displays
- **Test**: Achievement system

### 5. Review Mode
- **Test**: Spaced repetition scheduling
- **Verify**: Questions prioritized by forgetting curve
- **Check**: Adaptive difficulty based on performance

## 🧪 Key Features to Validate

### Question Quality (v1.2 improvement)
```javascript
// Each question should have:
- Bloom's level appropriate difficulty
- 4 plausible distractors
- Clear explanation
- Critic score ≥ 8/10
```

### Confidence Calibration
```javascript
// Before each answer:
1. User selects confidence (1-5)
2. Answer recorded with confidence
3. Used for Bayesian knowledge tracking
```

### Knowledge Tracking
```javascript
// After each answer:
- Bayesian update: P(knows|evidence)
- Spaced repetition: next review calculated
- Analytics: real-time dashboard update
```

## 📊 Expected Metrics

### Performance Benchmarks
- Course generation: 2-3 seconds
- Question quality: 85%+ critic approval
- UI responsiveness: <100ms interactions
- Accessibility: 90+ Lighthouse score

### Learning Science Validation
- Knowledge retention: Follows forgetting curve
- Review intervals: 1, 6, 15, 30, 90 days
- Confidence correlation: Higher confidence = better retention

## 🔍 Code Review Focus Areas

### 1. Architecture (`/src/lib/`)
- **coursePipeline/**: Modular generation system
- **learnerModel/**: Bayesian + SM2 algorithms
- **gamification/**: Achievement conditions

### 2. Database Schema (`/prisma/schema.prisma`)
- User progress tracking
- Skill knowledge probabilities
- Spaced repetition schedules

### 3. API Design (`/src/pages/api/`)
- RESTful endpoints
- Rate limiting implementation
- Error handling

### 4. React Components (`/src/components/`)
- QuizCard with confidence
- AnalyticsDashboard with charts
- CompletionModal with confetti

## 🐛 Known Limitations

1. **SQLite in Browser**: Review mode requires server
2. **Mock Data**: Standalone demo uses fixed content
3. **No Persistence**: Demo doesn't save progress

## 💡 Testing Without NPM

For environments without npm access, focus on:

1. **Code Review**: Architecture and implementation quality
2. **Standalone Demo**: Interactive feature testing
3. **API Design**: Endpoint structure and data flow
4. **Algorithm Review**: Learning science implementation

The standalone demo provides 80% of the user experience without requiring any dependencies!