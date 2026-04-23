import { withCors } from '../lib/cors.js'
import { supabase } from '../../backend/config/supabase.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content, imageUrl, imageBase64, imageMimeType, scheduledAt, userId, accessToken, organizationId } = req.body

  if (!userId || !accessToken) {
    return res.status(401).json({ error: 'Not authenticated. Please connect LinkedIn first.' })
  }

  if (!content || !scheduledAt) {
    return res.status(400).json({ error: 'Content and scheduledAt are required' })
  }

  if (new Date(scheduledAt) <= new Date()) {
    return res.status(400).json({ error: 'Scheduled time must be in the future' })
  }

  try {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        access_token: accessToken,
        content: content,
        image_url: imageUrl || null,
        image_base64: imageBase64 || null,
        image_mimetype: imageMimeType || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        organization_id: organizationId || null,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, jobId: data.id, scheduledAt: data.scheduled_at })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
