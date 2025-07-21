import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: {
      'content-type': req.headers['content-type'],
      'x-user-id': req.headers['x-user-id'],
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || false,
    }
  })
}