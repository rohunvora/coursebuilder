# Course Builder Debug Guide

## Quick Diagnosis

Visit: https://courseai-beta.vercel.app/api/test/diagnose

This will show you:
- OpenAI API key status
- Database connection status
- Environment configuration
- Specific error messages

## Common Issues & Solutions

### 1. Course Generation Fails Silently

**Symptom**: "Parsing your learning goal..." appears then disappears with no error

**Likely Cause**: Missing OpenAI API key

**Solution**:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. Redeploy the application

### 2. Dashboard Shows "No Data Available"

**Symptom**: Dashboard doesn't load any data, even for test users

**Possible Causes**:
- userId not being sent in headers
- Database connection issues

**Debug Steps**:
1. Open browser DevTools → Network tab
2. Check the `/api/user/dashboard` request
3. Verify it has `x-user-id` header
4. Check response for error messages

### 3. API Routes Return 404

**Symptom**: All API calls fail with 404 errors

**Solution**: Already fixed - API URLs now use relative paths

### 4. Test User Not Loading

**Symptom**: "Load Test User" button doesn't work

**Debug Steps**:
1. First run: `/api/test/seed` to create test data
2. Check localStorage for `userId`
3. Try the dashboard again

## Testing Endpoints

```bash
# Check system health
curl https://courseai-beta.vercel.app/api/health

# Run diagnostics
curl https://courseai-beta.vercel.app/api/test/diagnose

# Seed test data
curl https://courseai-beta.vercel.app/api/test/seed

# Test course generation directly
curl https://courseai-beta.vercel.app/api/debug/generate?topic=Test
```

## Vercel Environment Variables Required

1. `OPENAI_API_KEY` - Your OpenAI API key
2. `DATABASE_URL` - Supabase connection string (already set)
3. `DIRECT_URL` - Supabase direct connection (already set)

## Viewing Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Functions" tab
4. Click on any API route to see logs

## Common Log Messages

- `[Goal Parser] OpenAI API key not configured` - Missing API key
- `[Generate API] Error generating course` - Check the error details
- `[Dashboard API] Using userId: null` - Client not sending userId header