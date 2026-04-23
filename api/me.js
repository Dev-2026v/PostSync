import { withCors } from './lib/cors.js'
import { supabase } from '../backend/config/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(200).json({ user: null })
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('user_data')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return res.status(200).json({ user: null })
    }

    const { id, name, picture } = data.user_data
    res.json({ user: { id, name, picture } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default withCors(handler)
