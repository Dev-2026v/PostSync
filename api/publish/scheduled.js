import { withCors } from '../lib/cors.js'
import { supabase } from '../../backend/config/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(401).json({ error: 'userId required' })
  }

  try {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
