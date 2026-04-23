import axios from 'axios'
import { withCors } from '../lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, page = '1', per_page = '12' } = req.query

  if (!query) {
    return res.status(400).json({ error: 'query required' })
  }

  try {
    const { data } = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query,
        page: parseInt(page),
        per_page: parseInt(per_page),
        orientation: 'landscape',
      },
      headers: { Authorization: process.env.PEXELS_API_KEY },
    })

    const results = data.photos.map(p => ({
      id: p.id,
      thumb: p.src.medium,
      full: p.src.large2x,
      alt: p.alt,
      credit: p.photographer,
      creditUrl: p.photographer_url,
    }))

    res.json(results)
  } catch (err) {
    console.error('Pexels error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
