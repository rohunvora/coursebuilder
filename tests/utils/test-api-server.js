#!/usr/bin/env node

/**
 * Course Builder v1.2 - API Test Server
 * 
 * This server provides a REST API for testing Course Builder functionality
 * without requiring a browser or npm dependencies.
 * 
 * Usage: node test-api-server.js
 * Then use curl or any HTTP client to test endpoints
 */

const http = require('http');
const url = require('url');

// Mock database
const db = {
  users: {},
  courses: {},
  skills: {}
};

// Mock course data
const mockCourses = {
  'stoic-philosophy': {
    id: 'course-stoic-123',
    title: 'Stoic Philosophy: From Basics to Mastery',
    microSkills: [
      {
        id: 'skill-1',
        name: 'Core Stoic Principles',
        explanation: 'Understanding the fundamental tenets of Stoicism.',
        bloomLevel: 'Remember',
        quiz: {
          question: 'Which of these is NOT one of the four cardinal virtues in Stoicism?',
          choices: ['Wisdom', 'Wealth', 'Justice', 'Courage'],
          correctIndex: 1,
          explanation: 'The four cardinal virtues are Wisdom, Justice, Courage, and Temperance.',
          criticScore: 9
        }
      },
      {
        id: 'skill-2',
        name: 'The Dichotomy of Control',
        explanation: 'Learning to distinguish between what is within our control and what is not.',
        bloomLevel: 'Understand',
        quiz: {
          question: 'According to Epictetus, what should we focus our energy on?',
          choices: ['Changing others opinions', 'Controlling external events', 'Our own thoughts and actions', 'Achieving perfect outcomes'],
          correctIndex: 2,
          explanation: 'Epictetus taught that we should focus only on what is within our control.',
          criticScore: 9
        }
      }
    ]
  }
};

// Bayesian Knowledge Tracking
function updateKnowledge(current, isCorrect, confidence = 3) {
  const pLearn = 0.1;
  const pGuess = 0.2;
  const pSlip = 0.1;
  
  const confAdjust = (confidence - 3) * 0.05;
  const adjGuess = Math.max(0.1, Math.min(0.3, pGuess - confAdjust));
  const adjSlip = Math.max(0.05, Math.min(0.2, pSlip + confAdjust));
  
  let newProb;
  if (isCorrect) {
    const likelihood = current * (1 - adjSlip) + (1 - current) * adjGuess;
    newProb = (current * (1 - adjSlip)) / likelihood;
  } else {
    const likelihood = current * adjSlip + (1 - current) * (1 - adjGuess);
    newProb = (current * adjSlip) / likelihood;
  }
  
  const afterLearn = newProb + (1 - newProb) * pLearn;
  return Math.max(0, Math.min(1, afterLearn));
}

// API Routes
const routes = {
  'GET /api/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      version: '1.2',
      features: [
        'Bayesian Knowledge Tracking',
        'Spaced Repetition (SM2)',
        'Confidence Calibration',
        'Achievement System',
        'Learning Analytics'
      ]
    }));
  },

  'POST /api/user': (req, res) => {
    const userId = 'user-' + Date.now();
    db.users[userId] = {
      id: userId,
      xp: 0,
      level: 1,
      streak: 0,
      achievements: [],
      created: new Date().toISOString()
    };
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.users[userId]));
  },

  'GET /api/user/:userId': (req, res, params) => {
    const user = db.users[params.userId];
    if (!user) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  },

  'POST /api/course/generate': (req, res, body) => {
    const { topic } = body;
    const courseId = 'course-' + Date.now();
    
    // Simulate AI delay
    setTimeout(() => {
      const course = topic.toLowerCase().includes('stoic') 
        ? mockCourses['stoic-philosophy']
        : {
            id: courseId,
            title: `${topic}: Comprehensive Learning Path`,
            microSkills: Array.from({ length: 3 }, (_, i) => ({
              id: `skill-${i + 1}`,
              name: `${topic} Concept ${i + 1}`,
              explanation: `Understanding key concept ${i + 1} of ${topic}.`,
              bloomLevel: ['Remember', 'Understand', 'Apply'][i],
              quiz: {
                question: `What is important about ${topic} concept ${i + 1}?`,
                choices: ['Option A', 'Option B (Correct)', 'Option C', 'Option D'],
                correctIndex: 1,
                explanation: 'Option B is correct because...',
                criticScore: 8
              }
            }))
          };
      
      db.courses[courseId] = course;
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(course));
    }, 1000);
  },

  'GET /api/course/:courseId': (req, res, params) => {
    const course = db.courses[params.courseId] || mockCourses[params.courseId];
    if (!course) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Course not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(course));
  },

  'POST /api/answer': (req, res, body) => {
    const { userId, skillId, answer, confidence, correct } = body;
    
    const key = `${userId}-${skillId}`;
    if (!db.skills[key]) {
      db.skills[key] = {
        knowledgeProb: 0.3,
        attempts: 0,
        correctAttempts: 0
      };
    }
    
    const skill = db.skills[key];
    skill.attempts++;
    if (correct) skill.correctAttempts++;
    
    // Update knowledge using Bayesian tracking
    skill.knowledgeProb = updateKnowledge(skill.knowledgeProb, correct, confidence);
    
    // Update user XP
    if (db.users[userId] && correct) {
      db.users[userId].xp += 10;
      if (db.users[userId].xp >= 100) {
        db.users[userId].level++;
        db.users[userId].xp = 0;
      }
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      knowledgeProb: skill.knowledgeProb,
      totalAttempts: skill.attempts,
      accuracy: skill.correctAttempts / skill.attempts,
      xpGained: correct ? 10 : 0
    }));
  },

  'GET /api/analytics/:userId': (req, res, params) => {
    const userSkills = Object.entries(db.skills)
      .filter(([key]) => key.startsWith(params.userId))
      .map(([key, skill]) => ({
        skillId: key.split('-').slice(1).join('-'),
        ...skill
      }));
    
    const analytics = {
      totalSkills: userSkills.length,
      masteredSkills: userSkills.filter(s => s.knowledgeProb > 0.8).length,
      averageKnowledge: userSkills.reduce((sum, s) => sum + s.knowledgeProb, 0) / (userSkills.length || 1),
      totalAttempts: userSkills.reduce((sum, s) => sum + s.attempts, 0),
      overallAccuracy: userSkills.reduce((sum, s) => sum + (s.correctAttempts / (s.attempts || 1)), 0) / (userSkills.length || 1),
      skills: userSkills
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(analytics));
  }
};

// Request handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse body for POST requests
  let body = {};
  if (method === 'POST') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    try {
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) {
      body = {};
    }
  }
  
  // Route matching
  let handled = false;
  for (const [route, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = route.split(' ');
    if (routeMethod !== method) continue;
    
    // Simple param matching
    const routeParts = routePath.split('/');
    const pathParts = pathname.split('/');
    if (routeParts.length !== pathParts.length) continue;
    
    const params = {};
    let match = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    
    if (match) {
      handler(req, res, params, body);
      handled = true;
      break;
    }
  }
  
  if (!handled) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         Course Builder v1.2 - API Test Server                ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}                     ║
║                                                              ║
║  Test with curl:                                             ║
║  ▸ curl http://localhost:${PORT}/api/health                    ║
║  ▸ curl -X POST http://localhost:${PORT}/api/user              ║
║  ▸ curl -X POST http://localhost:${PORT}/api/course/generate \\  ║
║         -H "Content-Type: application/json" \\                ║
║         -d '{"topic":"Stoic Philosophy"}'                    ║
║                                                              ║
║  Features:                                                   ║
║  • Bayesian Knowledge Tracking                               ║
║  • Confidence-based learning                                 ║
║  • XP and leveling system                                    ║
║  • Learning analytics                                        ║
║  • No npm dependencies required                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});