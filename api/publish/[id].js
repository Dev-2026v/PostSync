import { withCors } from '../lib/cors.js'
import { supabase } from '../../backend/config/supabase.js'

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'id required' })
  }

  try {
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)