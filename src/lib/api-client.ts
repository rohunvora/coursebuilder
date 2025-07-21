import { config, getApiUrl } from './config';

// Import toast conditionally to avoid SSR issues
let toast: any = null;
if (typeof window !== 'undefined') {
  toast = require('react-hot-toast').toast;
}

// Types for API responses
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// API client with error handling and debug logging
class ApiClient {
  private async logDebug(type: string, data: any) {
    if (!config.debugMode && !config.testMode) return;
    
    try {
      await fetch(getApiUrl('/api/debug'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : null,
          data,
        }),
      });
    } catch (err) {
      console.error('Debug logging failed:', err);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async get<T = any>(path: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(getApiUrl(path), {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      const data = await this.handleResponse<T>(response);
      await this.logDebug('api_get_success', { path, status: response.status });
      return data;
    } catch (error) {
      await this.logDebug('api_get_error', { path, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async post<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(getApiUrl(path), {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await this.handleResponse<T>(response);
      await this.logDebug('api_post_success', { path, status: response.status });
      return data;
    } catch (error) {
      await this.logDebug('api_post_error', { path, body, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // Helper for operations with status messages
  async withStatus<T>(
    operation: () => Promise<T>,
    messages: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ): Promise<T> {
    const toastId = messages.loading ? toast.loading(messages.loading) : null;
    
    try {
      const result = await operation();
      if (toastId) {
        toast.success(messages.success || 'Success!', { id: toastId });
      }
      return result;
    } catch (error) {
      if (toastId && toast) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        toast.error(messages.error || errorMessage, { id: toastId });
      }
      throw error;
    }
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export typed API methods for common operations
export const courseApi = {
  generate: (topic: string, userId: string) =>
    api.withStatus(
      () => api.post('/api/generate', { topic, userId }),
      {
        loading: 'Parsing goal...',
        success: 'Course generated successfully!',
        error: 'Failed to generate course',
      }
    ),
    
  get: (courseId: string) =>
    api.get(`/api/course/${courseId}`),
    
  submitAnswer: (data: any) =>
    api.withStatus(
      () => api.post('/api/review/answer', data),
      {
        loading: 'Submitting answer...',
        success: `Answer recorded! ${data.correct ? '+10 XP' : 'Try again!'}`,
        error: 'Failed to submit answer',
      }
    ),
};

export const userApi = {
  getDashboard: () =>
    api.withStatus(
      () => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!userId) {
          throw new Error('No user ID found');
        }
        return api.get('/api/user/dashboard', {
          headers: {
            'x-user-id': userId
          }
        });
      },
      {
        loading: 'Loading dashboard...',
        success: 'Dashboard loaded',
        error: 'Failed to load dashboard',
      }
    ),
    
  resetTestUser: (template: 'beginner' | 'intermediate' | 'advanced') =>
    api.withStatus(
      () => api.post('/api/test/reset', { template }),
      {
        loading: 'Resetting test user...',
        success: `Test user reset to ${template} template`,
        error: 'Failed to reset test user',
      }
    ),
};

export const debugApi = {
  getInfo: (userId?: string) =>
    api.get(`/api/debug${userId ? `?userId=${userId}` : ''}`),
    
  logEvent: (type: string, data: any) =>
    api.post('/api/debug', { type, data }),
};