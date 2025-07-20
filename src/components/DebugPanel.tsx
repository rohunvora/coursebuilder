import { useState, useEffect } from 'react';
import { config } from '@/lib/config';

interface DebugData {
  user: any;
  course: any;
  analytics: any;
  environment: {
    apiUrl: string;
    debugMode: boolean;
    testMode: boolean;
    features: typeof config.features;
  };
  errors: string[];
}

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugData, setDebugData] = useState<DebugData>({
    user: null,
    course: null,
    analytics: null,
    environment: {
      apiUrl: config.apiUrl,
      debugMode: config.debugMode,
      testMode: config.testMode,
      features: config.features,
    },
    errors: [],
  });
  
  // Hide in production unless explicitly enabled
  const shouldShow = config.debugMode && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_MODE === 'true');

  useEffect(() => {
    if (!shouldShow) return;

    // Load debug data from localStorage
    const loadDebugData = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const currentCourse = JSON.parse(localStorage.getItem('currentCourse') || 'null');
        const errors = JSON.parse(localStorage.getItem('debugErrors') || '[]');
        
        setDebugData(prev => ({
          ...prev,
          user,
          course: currentCourse,
          errors,
        }));
      } catch (err) {
        console.error('Failed to load debug data:', err);
      }
    };

    loadDebugData();
    const interval = setInterval(loadDebugData, 2000);
    return () => clearInterval(interval);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Toggle Debug Panel"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-gray-900 text-gray-100 p-4 rounded-lg shadow-xl max-w-md max-h-96 overflow-auto">
          <h3 className="text-lg font-bold mb-2 text-purple-400">Debug Panel</h3>
          
          {/* Environment Info */}
          <details className="mb-3">
            <summary className="cursor-pointer font-semibold text-green-400">Environment</summary>
            <pre className="text-xs mt-2 bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(debugData.environment, null, 2)}
            </pre>
          </details>

          {/* User State */}
          <details className="mb-3">
            <summary className="cursor-pointer font-semibold text-blue-400">
              User State {debugData.user && `(${debugData.user.id})`}
            </summary>
            {debugData.user ? (
              <div className="text-sm mt-2 bg-gray-800 p-2 rounded">
                <p>ID: {debugData.user.id}</p>
                <p>Level: {debugData.user.level} | XP: {debugData.user.xp}/100</p>
                <p>Streak: {debugData.user.streak} days</p>
                <p>Achievements: {debugData.user.achievements?.length || 0}</p>
                <p>Created: {new Date(debugData.user.created).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-sm mt-2 text-gray-400">No user logged in</p>
            )}
          </details>

          {/* Current Course */}
          <details className="mb-3">
            <summary className="cursor-pointer font-semibold text-yellow-400">
              Current Course {debugData.course && `(${debugData.course.id})`}
            </summary>
            {debugData.course ? (
              <div className="text-sm mt-2 bg-gray-800 p-2 rounded">
                <p>Title: {debugData.course.title}</p>
                <p>Skills: {debugData.course.microSkills?.length || 0}</p>
                <p>Progress: {debugData.course.progress || 0}%</p>
              </div>
            ) : (
              <p className="text-sm mt-2 text-gray-400">No course active</p>
            )}
          </details>

          {/* Errors */}
          {debugData.errors.length > 0 && (
            <details className="mb-3">
              <summary className="cursor-pointer font-semibold text-red-400">
                Errors ({debugData.errors.length})
              </summary>
              <div className="text-xs mt-2 bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
                {debugData.errors.map((error, i) => (
                  <p key={i} className="mb-1">{error}</p>
                ))}
              </div>
            </details>
          )}

          {/* Actions */}
          {config.testMode && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-sm font-semibold mb-2">Test Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-xs bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Reset All Data
                </button>
                <button
                  onClick={() => {
                    // Set the test user ID
                    localStorage.setItem('userId', 'test-user-intermediate');
                    // Clear any cached data
                    localStorage.removeItem('currentCourse');
                    localStorage.removeItem('user');
                    // Reload to fetch test user data from database
                    window.location.href = '/dashboard';
                  }}
                  className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors ml-2"
                >
                  Load Test User
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}