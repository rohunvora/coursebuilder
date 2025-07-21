// Safe wrapper for api-client that handles SSR
import type { courseApi as courseApiType, userApi as userApiType } from './api-client';

// These will be populated on client-side only
let courseApi: typeof courseApiType | null = null;
let userApi: typeof userApiType | null = null;

if (typeof window !== 'undefined') {
  // Dynamically import api-client on client-side only
  import('./api-client').then(module => {
    courseApi = module.courseApi;
    userApi = module.userApi;
  });
}

// Export safe wrappers that check for client-side
export const getCourseApi = () => {
  if (typeof window === 'undefined') {
    throw new Error('API client is only available on client-side');
  }
  if (!courseApi) {
    throw new Error('API client not yet loaded');
  }
  return courseApi;
};

export const getUserApi = () => {
  if (typeof window === 'undefined') {
    throw new Error('API client is only available on client-side');
  }
  if (!userApi) {
    throw new Error('API client not yet loaded');
  }
  return userApi;
};