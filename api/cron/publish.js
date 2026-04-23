import { supabase } from '../../backend/config/supabase.js'
import { publishPost } from '../../backend/services/linkedin.js'

export const config = {
  maxDuration: 60,
}

async function handler(req, res) {
  try {
    // Verify cron secret for security
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const now = new Date().toISOString()

    // Fetch all pending posts scheduled for now or earlier
    const { data: pending, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)

    if (fetchError) {
      console.error('Scheduler fetch error:', fetchError.message)
      return res.status(500).json({ error: fetchError.message })
    }

    if (!pending || pending.length === 0) {
      return res.json({ processed: 0, message: 'No posts to publish' })
    }

    let successCount = 0
    let failureCount = 0

    // Process each scheduled post
    for (const post of pending) {
      try {
        console.log(`Publishing post ${post.id} for user ${post.user_id}`)

        const result = await publishPost({
          accessToken: post.access_token,
          userId: post.user_id,
          content: post.content,
          imageUrl: post.image_url,
          imageBase64: post.image_base64 || null,
          imageMimeType: post.image_mimetype || null,
          organizationId: post.organization_id || null,
        })

        // Mark as published
        await supabase
          .from('scheduled_posts')
          .update({ status: 'published', published_at: new Date().toISOString() })
          .eq('id', post.id)

        successCount++
      } catch (publishError) {
        console.error(`Failed to publish post ${post.id}:`, publishError.message)

        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'failed', 
            error_message: publishError.message 
          })
          .eq('id', post.id)

        failureCount++
      }
    }

    res.json({
      processed: pending.length,
      success: successCount,
      failed: failureCount,
    })
  } catch (error) {
    console.error('Cron handler error:', error.message)
    res.status(500).json({ error: error.message })
  }
}

export default handler
