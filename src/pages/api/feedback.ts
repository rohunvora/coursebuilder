import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { courseId, skillId, rating, comment, timestamp } = req.body

  if (!courseId || !skillId || !rating) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const feedback = {
    courseId,
    skillId,
    rating,
    comment,
    timestamp: timestamp || Date.now(),
  }

  console.log('Feedback received:', JSON.stringify(feedback, null, 2))

  return res.status(200).json({ success: true })
}