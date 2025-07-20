import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from '@/lib/config';

// Test user templates
const testUserTemplates = {
  beginner: {
    id: config.testUsers.beginner,
    level: 1,
    xp: 0,
    streak: 0,
    achievements: [],
    courses: [],
    skills: {},
  },
  intermediate: {
    id: config.testUsers.intermediate,
    level: 5,
    xp: 42,
    streak: 7,
    achievements: ['first-answer', 'streak-3', 'streak-7'],
    courses: ['course-stoic-101'],
    skills: {
      'skill-1': { knowledgeProb: 0.85, attempts: 10, correct: 8 },
      'skill-2': { knowledgeProb: 0.72, attempts: 8, correct: 6 },
      'skill-3': { knowledgeProb: 0.45, attempts: 5, correct: 2 },
    },
  },
  advanced: {
    id: config.testUsers.advanced,
    level: 12,
    xp: 78,
    streak: 30,
    achievements: ['first-answer', 'streak-3', 'streak-7', 'master-skill', 'level-5'],
    courses: ['course-stoic-101', 'course-quantum-202', 'course-ml-303'],
    skills: {
      'skill-1': { knowledgeProb: 0.95, attempts: 20, correct: 19 },
      'skill-2': { knowledgeProb: 0.88, attempts: 15, correct: 13 },
      'skill-3': { knowledgeProb: 0.82, attempts: 12, correct: 10 },
      'skill-4': { knowledgeProb: 0.76, attempts: 10, correct: 7 },
      'skill-5': { knowledgeProb: 0.91, attempts: 18, correct: 16 },
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in test mode
  if (!config.testMode) {
    return res.status(403).json({ error: 'Test endpoints disabled in production' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, template = 'beginner' } = req.body;

  try {
    // Get template
    const userTemplate = testUserTemplates[template as keyof typeof testUserTemplates];
    if (!userTemplate) {
      return res.status(400).json({ error: 'Invalid template. Use: beginner, intermediate, or advanced' });
    }

    // Create test user data
    const testUser = {
      ...userTemplate,
      id: userId || userTemplate.id,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    // In a real app, this would reset the database records
    // For now, we'll return the test data for the client to use
    
    return res.status(200).json({
      success: true,
      message: `Test user reset to ${template} template`,
      user: testUser,
      instructions: 'Store this user data in localStorage or your state management system',
    });
  } catch (error) {
    console.error('Reset test user error:', error);
    return res.status(500).json({ error: 'Failed to reset test user' });
  }
}