import { withCors } from './lib/cors.js'
import { rewritePost } from '../backend/services/claude.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content, tone = 'professional', length = 'medium' } = req.body

  if (!content) {
    return res.status(400).json({ error: 'Content is required' })
  }

  try {
    const rewrittenContent = await rewritePost({ content, tone, length })

    res.json({
      content: rewrittenContent,
      tone,
      length,
    })
  } catch (err) {
    console.error('Regen error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
