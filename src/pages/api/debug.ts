import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from '@/lib/config';

// Simple in-memory store for debug data (in production, use database)
const debugStore = new Map<string, any>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in debug/test mode
  if (!config.debugMode && !config.testMode) {
    return res.status(403).json({ error: 'Debug endpoint disabled' });
  }

  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { userId } = req.query;
    
    if (!userId) {
      // Return general debug info
      return res.status(200).json({
        environment: {
          nodeEnv: process.env.NODE_ENV,
          apiUrl: config.apiUrl,
          debugMode: config.debugMode,
          testMode: config.testMode,
          features: config.features,
          serverTime: new Date().toISOString(),
        },
        testUsers: config.testUsers,
        recentEvents: Array.from(debugStore.entries()).slice(-10).map(([key, value]) => ({
          key,
          timestamp: value.timestamp,
          type: value.type,
        })),
      });
    }

    // Return user-specific debug data
    const userData = debugStore.get(`user-${userId}`);
    const events = Array.from(debugStore.entries())
      .filter(([key]) => key.includes(userId as string))
      .map(([key, value]) => ({ key, ...value }));

    return res.status(200).json({
      userId,
      userData,
      events,
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'POST') {
    const { type, userId, data } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Event type required' });
    }

    const eventKey = userId ? `${userId}-${type}-${Date.now()}` : `${type}-${Date.now()}`;
    const eventData = {
      type,
      userId,
      data,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
    };

    debugStore.set(eventKey, eventData);

    // Keep only last 100 events
    if (debugStore.size > 100) {
      const firstKey = debugStore.keys().next().value;
      debugStore.delete(firstKey);
    }

    return res.status(200).json({ 
      success: true, 
      eventKey,
      message: 'Debug event logged',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}