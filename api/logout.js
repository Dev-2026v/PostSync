import { withCors } from './lib/cors.js'
import { supabase } from '../backend/config/supabase.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (userId) {
      await supabase
        .from('sessions')
        .delete()
        .eq('user_id', userId)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default withCors(handler)
