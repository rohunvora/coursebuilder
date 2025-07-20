#!/usr/bin/env node

/**
 * Course Builder v1.2 - Enhanced API Test Server
 * 
 * This server provides a complete REST API for testing Course Builder functionality
 * with all features properly implemented.
 * 
 * Usage: node test-api-server-v2.js
 * Then use curl or any HTTP client to test endpoints
 */

const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

// Data persistence file
const DB_FILE = path.join(__dirname, 'test-api-db.json');

// Initialize database
let db = {
  users: {},
  courses: {},
  skills: {},
  achievements: {
    'first-answer': { id: 'first-answer', name: 'First Steps', description: 'Submit your first answer', xp: 50 },
    'streak-3': { id: 'streak-3', name: 'Consistent Learner', description: '3 day streak', xp: 100 },
    'streak-7': { id: 'streak-7', name: 'Week Warrior', description: '7 day streak', xp: 250 },
    'master-skill': { id: 'master-skill', name: 'Skill Master', description: 'Master a skill (>80% knowledge)', xp: 200 },
    'level-5': { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', xp: 500 }
  }
};

// Bloom's Taxonomy levels
const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

// Load database from file
async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(data);
    console.log('📁 Loaded database from file');
  } catch (err) {
    console.log('📝 Starting with fresh database');
  }
}

// Save database to file
async function saveDatabase() {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('❌ Failed to save database:', err);
  }
}

// Mock course templates for different topics
const courseTemplates = {
  'stoic-philosophy': {
    title: 'Stoic Philosophy: From Basics to Mastery',
    skills: [
      { name: 'Core Stoic Principles', question: 'Which of these is NOT one of the four cardinal virtues in Stoicism?', choices: ['Wisdom', 'Wealth', 'Justice', 'Courage'], correct: 1 },
      { name: 'The Dichotomy of Control', question: 'According to Epictetus, what should we focus our energy on?', choices: ['Changing others opinions', 'Controlling external events', 'Our own thoughts and actions', 'Achieving perfect outcomes'], correct: 2 },
      { name: 'Stoic Practices', question: 'What is negative visualization in Stoicism?', choices: ['Pessimistic thinking', 'Imagining loss to appreciate what you have', 'Avoiding positive thoughts', 'Criticizing others'], correct: 1 },
      { name: 'Marcus Aurelius Meditations', question: 'What was Marcus Aurelius primary role while writing Meditations?', choices: ['Philosopher', 'Teacher', 'Roman Emperor', 'Soldier'], correct: 2 },
      { name: 'Stoic Ethics', question: 'What do Stoics believe is the highest good?', choices: ['Pleasure', 'Virtue', 'Knowledge', 'Power'], correct: 1 },
      { name: 'Modern Stoicism', question: 'How can Stoicism help with modern anxiety?', choices: ['By avoiding all stress', 'By controlling external events', 'By focusing on what we can control', 'By ignoring problems'], correct: 2 },
      { name: 'Stoic Leadership', question: 'What makes a Stoic leader effective?', choices: ['Emotional detachment', 'Rational decision-making and virtue', 'Strict discipline only', 'Never showing weakness'], correct: 1 }
    ]
  }
};

// Generate a course with 7 micro-skills
function generateCourse(topic) {
  const template = courseTemplates[topic.toLowerCase().replace(/[^a-z]/g, '-')];
  const courseId = 'course-' + Date.now();
  
  if (template) {
    return {
      id: courseId,
      title: template.title,
      microSkills: template.skills.map((skill, i) => ({
        id: `skill-${i + 1}`,
        name: skill.name,
        explanation: `Mastering ${skill.name} through ${BLOOM_LEVELS[Math.min(i, 5)].toLowerCase()} level understanding.`,
        bloomLevel: BLOOM_LEVELS[Math.min(i, 5)],
        difficulty: Math.min(i + 1, 6),
        quiz: {
          question: skill.question,
          choices: skill.choices,
          correctIndex: skill.correct,
          explanation: `This tests your ${BLOOM_LEVELS[Math.min(i, 5)].toLowerCase()} level understanding of ${skill.name}.`,
          criticScore: 7 + Math.min(i, 3)
        }
      }))
    };
  }
  
  // Generic course generation for any topic
  return {
    id: courseId,
    title: `${topic}: Comprehensive Learning Path`,
    microSkills: Array.from({ length: 7 }, (_, i) => ({
      id: `skill-${i + 1}`,
      name: `${topic} - ${['Fundamentals', 'Core Concepts', 'Applications', 'Advanced Techniques', 'Analysis Methods', 'Best Practices', 'Expert Strategies'][i]}`,
      explanation: `Developing ${BLOOM_LEVELS[Math.min(i, 5)].toLowerCase()} level mastery of ${topic}.`,
      bloomLevel: BLOOM_LEVELS[Math.min(i, 5)],
      difficulty: i + 1,
      quiz: {
        question: `Which best describes the ${['fundamental principle', 'core concept', 'practical application', 'advanced technique', 'analytical approach', 'best practice', 'expert strategy'][i]} of ${topic}?`,
        choices: [
          `Basic understanding of ${topic}`,
          `Correct application of ${topic} (CORRECT)`,
          `Common misconception about ${topic}`,
          `Outdated approach to ${topic}`
        ],
        correctIndex: 1,
        explanation: `Understanding this aspect requires ${BLOOM_LEVELS[Math.min(i, 5)].toLowerCase()} level thinking about ${topic}.`,
        criticScore: 7 + Math.min(i, 3)
      }
    }))
  };
}

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

// Spaced Repetition (SM-2 algorithm)
function calculateNextReview(quality, repetitions, interval, easeFactor) {
  if (quality < 3) {
    return {
      repetitions: 0,
      interval: 1,
      easeFactor: easeFactor
    };
  }
  
  const newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  let newInterval;
  
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEaseFactor);
  }
  
  return {
    repetitions: repetitions + 1,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Check and award achievements
function checkAchievements(userId) {
  const user = db.users[userId];
  if (!user) return [];
  
  const newAchievements = [];
  
  // First answer achievement
  const userSkills = Object.keys(db.skills).filter(key => key.startsWith(userId));
  if (userSkills.length >= 1 && !user.achievements.includes('first-answer')) {
    user.achievements.push('first-answer');
    user.xp += db.achievements['first-answer'].xp;
    newAchievements.push(db.achievements['first-answer']);
  }
  
  // Level 5 achievement
  if (user.level >= 5 && !user.achievements.includes('level-5')) {
    user.achievements.push('level-5');
    user.xp += db.achievements['level-5'].xp;
    newAchievements.push(db.achievements['level-5']);
  }
  
  // Skill mastery achievement
  const masteredSkills = userSkills.filter(key => db.skills[key].knowledgeProb > 0.8);
  if (masteredSkills.length >= 1 && !user.achievements.includes('master-skill')) {
    user.achievements.push('master-skill');
    user.xp += db.achievements['master-skill'].xp;
    newAchievements.push(db.achievements['master-skill']);
  }
  
  // Streak achievements
  if (user.streak >= 3 && !user.achievements.includes('streak-3')) {
    user.achievements.push('streak-3');
    user.xp += db.achievements['streak-3'].xp;
    newAchievements.push(db.achievements['streak-3']);
  }
  
  if (user.streak >= 7 && !user.achievements.includes('streak-7')) {
    user.achievements.push('streak-7');
    user.xp += db.achievements['streak-7'].xp;
    newAchievements.push(db.achievements['streak-7']);
  }
  
  return newAchievements;
}

// Update user streak
function updateStreak(userId) {
  const user = db.users[userId];
  if (!user) return;
  
  const today = new Date().toDateString();
  const lastActive = user.lastActive ? new Date(user.lastActive).toDateString() : null;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastActive === today) {
    // Already active today, no change
    return;
  } else if (lastActive === yesterday) {
    // Continuing streak
    user.streak++;
  } else {
    // Broken streak
    user.streak = 1;
  }
  
  user.lastActive = new Date().toISOString();
}

// API Routes
const routes = {
  'GET /api/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      version: '1.2-enhanced',
      features: [
        'Bayesian Knowledge Tracking',
        'Spaced Repetition (SM2)',
        'Confidence Calibration',
        'Achievement System',
        'Learning Analytics',
        'Data Persistence',
        'Server-side Answer Validation',
        '7 Micro-skills per Course',
        'Bloom\'s Taxonomy Integration'
      ]
    }));
  },

  'POST /api/user': async (req, res) => {
    const userId = 'user-' + Date.now();
    db.users[userId] = {
      id: userId,
      xp: 0,
      level: 1,
      streak: 0,
      achievements: [],
      created: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    await saveDatabase();
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

  'POST /api/course/generate': async (req, res, params, body) => {
    if (!body || !body.topic) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Topic is required' }));
      return;
    }
    
    const { topic } = body;
    
    // Simulate AI delay
    setTimeout(async () => {
      const course = generateCourse(topic);
      db.courses[course.id] = course;
      await saveDatabase();
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(course));
    }, 1000);
  },

  'GET /api/course/:courseId': (req, res, params) => {
    const course = db.courses[params.courseId];
    if (!course) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Course not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(course));
  },

  'POST /api/answer': async (req, res, params, body) => {
    const { userId, courseId, skillId, answer, confidence = 3 } = body;
    
    // Validate input
    if (!userId || !courseId || !skillId || answer === undefined) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'userId, courseId, skillId, and answer are required' }));
      return;
    }
    
    // Get course and skill to validate answer
    const course = db.courses[courseId];
    if (!course) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Course not found' }));
      return;
    }
    
    const skill = course.microSkills.find(s => s.id === skillId);
    if (!skill) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Skill not found' }));
      return;
    }
    
    // Server-side answer validation
    const correct = answer === skill.quiz.correctIndex;
    
    const key = `${userId}-${skillId}`;
    if (!db.skills[key]) {
      db.skills[key] = {
        userId,
        courseId,
        skillId,
        knowledgeProb: 0.3,
        attempts: 0,
        correctAttempts: 0,
        repetitions: 0,
        interval: 1,
        easeFactor: 2.5,
        lastReview: new Date().toISOString()
      };
    }
    
    const skillData = db.skills[key];
    skillData.attempts++;
    if (correct) skillData.correctAttempts++;
    
    // Update knowledge using Bayesian tracking
    skillData.knowledgeProb = updateKnowledge(skillData.knowledgeProb, correct, confidence);
    
    // Update spaced repetition data
    const quality = correct ? Math.min(5, 3 + confidence / 2.5) : 2;
    const srUpdate = calculateNextReview(quality, skillData.repetitions, skillData.interval, skillData.easeFactor);
    Object.assign(skillData, srUpdate);
    skillData.lastReview = new Date().toISOString();
    
    // Update user XP and streak
    if (db.users[userId]) {
      updateStreak(userId);
      if (correct) {
        const xpGained = 10 + Math.floor(confidence / 2);
        db.users[userId].xp += xpGained;
        
        // Level up
        while (db.users[userId].xp >= 100) {
          db.users[userId].level++;
          db.users[userId].xp -= 100;
        }
      }
    }
    
    // Check for new achievements
    const newAchievements = checkAchievements(userId);
    
    await saveDatabase();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      correct,
      knowledgeProb: skillData.knowledgeProb,
      totalAttempts: skillData.attempts,
      accuracy: skillData.correctAttempts / skillData.attempts,
      xpGained: correct ? 10 + Math.floor(confidence / 2) : 0,
      nextReview: skillData.nextReview,
      newAchievements
    }));
  },

  'GET /api/analytics/:userId': (req, res, params) => {
    const userSkills = Object.entries(db.skills)
      .filter(([key, skill]) => skill.userId === params.userId)
      .map(([key, skill]) => ({
        courseId: skill.courseId,
        skillId: skill.skillId,
        knowledgeProb: skill.knowledgeProb,
        attempts: skill.attempts,
        correctAttempts: skill.correctAttempts,
        accuracy: skill.correctAttempts / (skill.attempts || 1),
        nextReview: skill.nextReview,
        repetitions: skill.repetitions,
        interval: skill.interval
      }));
    
    const user = db.users[params.userId] || {};
    
    const analytics = {
      userId: params.userId,
      totalSkills: userSkills.length,
      masteredSkills: userSkills.filter(s => s.knowledgeProb > 0.8).length,
      learningSkills: userSkills.filter(s => s.knowledgeProb >= 0.4 && s.knowledgeProb <= 0.8).length,
      strugglingSkills: userSkills.filter(s => s.knowledgeProb < 0.4).length,
      averageKnowledge: userSkills.reduce((sum, s) => sum + s.knowledgeProb, 0) / (userSkills.length || 1),
      totalAttempts: userSkills.reduce((sum, s) => sum + s.attempts, 0),
      overallAccuracy: userSkills.reduce((sum, s) => sum + s.accuracy, 0) / (userSkills.length || 1),
      currentStreak: user.streak || 0,
      totalXP: (user.level - 1) * 100 + user.xp,
      achievements: user.achievements || [],
      skillsForReview: userSkills.filter(s => new Date(s.nextReview) <= new Date()).length,
      skills: userSkills
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(analytics));
  },

  'GET /api/achievements': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(Object.values(db.achievements)));
  },

  'GET /api/achievements/:userId': (req, res, params) => {
    const user = db.users[params.userId];
    if (!user) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    const userAchievements = user.achievements.map(id => db.achievements[id]).filter(Boolean);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userAchievements));
  },

  'POST /api/streak/:userId': async (req, res, params) => {
    updateStreak(params.userId);
    await saveDatabase();
    
    const user = db.users[params.userId];
    if (!user) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ streak: user.streak, lastActive: user.lastActive }));
  },

  'GET /api/review/:userId': (req, res, params) => {
    const now = new Date();
    const skillsForReview = Object.entries(db.skills)
      .filter(([key, skill]) => skill.userId === params.userId && new Date(skill.nextReview) <= now)
      .map(([key, skill]) => ({
        courseId: skill.courseId,
        skillId: skill.skillId,
        knowledgeProb: skill.knowledgeProb,
        lastReview: skill.lastReview,
        nextReview: skill.nextReview,
        interval: skill.interval,
        repetitions: skill.repetitions
      }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(skillsForReview));
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
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
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
      try {
        await handler(req, res, params, body);
      } catch (err) {
        console.error('Handler error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
      handled = true;
      break;
    }
  }
  
  if (!handled) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
  }
});

// Start server
const PORT = process.env.PORT || 3000;

loadDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║      Course Builder v1.2 - Enhanced API Test Server          ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}                     ║
║                                                              ║
║  New Endpoints:                                              ║
║  ▸ GET  /api/achievements                                    ║
║  ▸ GET  /api/achievements/:userId                           ║
║  ▸ POST /api/streak/:userId                                 ║
║  ▸ GET  /api/review/:userId                                 ║
║                                                              ║
║  Enhanced Features:                                          ║
║  ✅ Fixed route parameter handling                           ║
║  ✅ Server-side answer validation                            ║
║  ✅ 7 micro-skills per course with Bloom's taxonomy         ║
║  ✅ Achievement system with XP rewards                       ║
║  ✅ Streak tracking and persistence                          ║
║  ✅ Spaced repetition scheduling (SM-2)                      ║
║  ✅ Data persistence to file                                 ║
║  ✅ Standardized analytics output                            ║
║                                                              ║
║  Test with: ./test-scripts.sh                                ║
╚══════════════════════════════════════════════════════════════╝
  `);
  });
});