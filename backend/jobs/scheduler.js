import cron from 'node-cron'
import { supabase } from '../config/supabase.js'
import { publishPost } from '../services/linkedin.js'

export function startScheduler() {
    cron.schedule('* * * * *', async () => {
        const now = new Date().toISOString()

        const { data: pending, error } = await supabase
            .from('scheduled_posts')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_at', now)

        if (error) return console.error('Scheduler fetch error:', error.message)

        for (const post of pending) {
            try {
                const result = await publishPost({
                    accessToken: post.access_token,
                    userId: post.user_id,
                    content: post.content,
                    imageUrl: post.image_url,
                    imageBase64: post.image_base64 || null,
                    imageMimeType: post.image_mimetype || null,
                    organizationId: post.organization_id || null,
                })

                await supabase
                    .from('scheduled_posts')
                    .update({ status: 'published', linkedin_post_id: result.id })
                    .eq('id', post.id)


                console.log(`Published scheduled post ${post.id}`)
            } catch (err) {
                await supabase
                    .from('scheduled_posts')
                    .update({ status: 'failed', error_message: err.message })
                    .eq('id', post.id)

                console.error(`Failed scheduled post ${post.id}:`, err.message)
            }
        }
    })
    console.log('Scheduler started - checking every minute')
}