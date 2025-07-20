# Course Builder - Vercel Deployment Guide

## Overview

This guide explains how to deploy Course Builder to Vercel with full debugging capabilities, test user management, and proper environment configuration.

## Quick Deploy

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/coursebuilder)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 2. Configure Environment Variables

In your Vercel dashboard, add these environment variables:

```env
# Required
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=your-database-url

# Optional (defaults shown)
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_ENABLE_ACHIEVEMENTS=true
NEXT_PUBLIC_ENABLE_SPACED_REPETITION=true
NEXT_PUBLIC_ENABLE_CONFIDENCE_TRACKING=true
```

### 3. Access Your Deployment

Once deployed, you'll have access to:

- **Main App**: `https://your-app.vercel.app`
- **Debug Panel**: Click the gear icon in bottom-right (when DEBUG_MODE=true)
- **Debug API**: `https://your-app.vercel.app/api/debug`
- **Test Reset**: `https://your-app.vercel.app/api/test/reset`

## Key Features for Testing

### 1. Debug Panel

When `NEXT_PUBLIC_DEBUG_MODE=true`, a floating debug panel appears with:

- **Environment Info**: Current configuration and feature flags
- **User State**: Current user ID, level, XP, streak, achievements
- **Current Course**: Active course details and progress
- **Error Log**: Recent errors with stack traces
- **Test Actions**: Reset data, load test users

### 2. Status Messages

All operations show clear status messages:

- "Parsing goal..." → "Generating course..." → "Course ready!"
- "Submitting answer..." → "Answer recorded! +10 XP"
- "Loading dashboard..." → "Dashboard loaded"

### 3. Test User System

Three pre-configured test users:

```javascript
// Beginner (fresh start)
POST /api/test/reset
{ "template": "beginner" }

// Intermediate (level 5, some progress)
POST /api/test/reset
{ "template": "intermediate" }

// Advanced (level 12, multiple courses)
POST /api/test/reset
{ "template": "advanced" }
```

### 4. Debug Endpoints

```bash
# Get debug info
GET https://your-app.vercel.app/api/debug

# Get user-specific debug data
GET https://your-app.vercel.app/api/debug?userId=USER_ID

# Log debug event
POST https://your-app.vercel.app/api/debug
{
  "type": "course_generated",
  "userId": "user-123",
  "data": { "courseId": "course-456", "topic": "Stoicism" }
}
```

## Testing Workflows

### 1. Fresh User Experience

1. Open the app in incognito/private browsing
2. Complete onboarding flow
3. Generate a course
4. Answer questions
5. Check debug panel for state updates

### 2. Returning User Experience

1. Click "Load Test User" in debug panel
2. Navigate to dashboard
3. Continue existing course
4. Check achievements and progress

### 3. Error Testing

1. Disconnect internet briefly
2. Try to generate a course
3. Check error messages and debug panel
4. Reconnect and retry

### 4. State Reset

1. Click "Reset All Data" in debug panel
2. Or call: `localStorage.clear(); location.reload()`
3. Start fresh

## Environment-Specific Behavior

### Development (localhost)
- Full debug capabilities
- Detailed error messages
- Test endpoints enabled
- CORS headers for API testing

### Production (Vercel)
- Set `NEXT_PUBLIC_DEBUG_MODE=false` for real users
- Keep `NEXT_PUBLIC_TEST_MODE=true` for testing
- Error details hidden from users
- Analytics/monitoring enabled

## Troubleshooting

### Common Issues

1. **Blank Page**
   - Check browser console for errors
   - Verify environment variables in Vercel
   - Check `/api/debug` endpoint

2. **API Errors**
   - Ensure OPENAI_API_KEY is set
   - Check API rate limits
   - Verify DATABASE_URL is correct

3. **State Not Persisting**
   - Check localStorage in browser
   - Verify database connection
   - Check for CORS issues

### Debug Checklist

- [ ] Environment variables set in Vercel?
- [ ] Database migrations run? (`npm run vercel-build`)
- [ ] API endpoints returning data?
- [ ] Debug panel visible?
- [ ] Error boundary catching errors?

## Monitoring

### Key Metrics to Watch

1. **User Journey**
   - Onboarding completion rate
   - Course generation success
   - Question completion rate
   - Achievement unlock rate

2. **Performance**
   - Page load times
   - API response times
   - Course generation duration

3. **Errors**
   - Client-side errors (debug panel)
   - API errors (server logs)
   - Database connection issues

### Analytics Events

The app logs these events to `/api/debug`:

- `user_created` - New user registration
- `course_generated` - Course creation
- `answer_submitted` - Quiz attempt
- `achievement_unlocked` - Achievement earned
- `error` - Any errors

## Security Notes

- Never expose `OPENAI_API_KEY` in client code
- Use environment variables for all secrets
- Implement rate limiting for production
- Sanitize user inputs
- Use HTTPS for all API calls

## Next Steps

1. Deploy to Vercel
2. Configure environment variables
3. Test all user flows
4. Monitor debug panel
5. Provide feedback with specific error messages/states

---

For questions or issues, check:
- Debug Panel (gear icon)
- `/api/debug` endpoint
- Browser console
- Vercel function logs