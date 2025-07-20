# API Client Migration Guide

## Overview

To improve error handling, debugging, and status messages, we've created a centralized API client. Here's how to migrate existing code:

## Before (Direct Fetch)

```typescript
// In pages/index.tsx
try {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, userId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate course');
  }
  
  const data = await response.json();
  toast.success('Course generated!');
  // ... handle data
} catch (error) {
  toast.error('Failed to generate course');
  console.error(error);
}
```

## After (API Client)

```typescript
// In pages/index.tsx
import { courseApi } from '@/lib/api-client';

try {
  const data = await courseApi.generate(topic, userId);
  // Status messages handled automatically!
  // ... handle data
} catch (error) {
  // Error already shown to user
  console.error(error);
}
```

## Benefits

1. **Automatic Status Messages**: Loading, success, and error states shown automatically
2. **Debug Logging**: All API calls logged in debug mode
3. **Consistent Error Handling**: Errors parsed and displayed consistently
4. **Environment Aware**: Uses correct API URLs based on environment
5. **Type Safety**: Fully typed API methods

## API Methods Available

### Course API
```typescript
courseApi.generate(topic, userId)
courseApi.get(courseId)
courseApi.submitAnswer(answerData)
```

### User API
```typescript
userApi.getDashboard()
userApi.resetTestUser('beginner' | 'intermediate' | 'advanced')
```

### Debug API
```typescript
debugApi.getInfo(userId?)
debugApi.logEvent(type, data)
```

## Custom Status Messages

```typescript
import { api } from '@/lib/api-client';

// Custom messages
const data = await api.withStatus(
  () => api.post('/api/custom', { data }),
  {
    loading: 'Processing...',
    success: 'Custom success!',
    error: 'Custom error!'
  }
);

// No messages (silent)
const data = await api.post('/api/custom', { data });
```

## Migration Checklist

- [ ] Import API client instead of using fetch
- [ ] Replace fetch calls with API methods
- [ ] Remove manual toast notifications
- [ ] Remove manual error handling (unless custom needed)
- [ ] Test status messages appear correctly
- [ ] Verify debug logging in debug mode