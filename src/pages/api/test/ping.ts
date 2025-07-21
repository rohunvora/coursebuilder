import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[Ping] Request received:', {
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  })
  
  res.status(200).json({ 
    pong: true,
    timestamp: new Date().toISOString(),
    receivedData: {
      method: req.method,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      queryKeys: Object.keys(req.query),
    }
  })
}