import { withCors } from '../lib/cors.js'
import { publishPost } from '../../backend/services/linkedin.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content, imageUrl, imageBase64, imageMimeType, userId, accessToken, organizationId } = req.body

  if (!userId || !accessToken) {
    return res.status(401).json({ error: 'Not authenticated. Please connect LinkedIn first.' })
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' })
  }

  try {
    const result = await publishPost({
      accessToken,
      userId,
      content,
      imageUrl: imageUrl || null,
      imageBase64: imageBase64 || null,
      imageMimeType: imageMimeType || null,
      organizationId: organizationId || null,
    })

    res.json({ success: true, postId: result.id })
  } catch (err) {
    console.error('Publish error:', err.response?.data || err.message)
    res.status(500).json({ error: err.response?.data?.message || err.message })
  }
}

export default withCors(handler)
