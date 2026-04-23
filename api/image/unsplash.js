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
    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        page: parseInt(page),
        per_page: parseInt(per_page),
        orientation: 'landscape',
      },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    })

    const results = data.results.map(p => ({
      id: p.id,
      thumb: p.urls.small,
      full: p.urls.regular,
      alt: p.alt_description,
      credit: p.user.name,
      creditUrl: p.user.links.html,
    }))

    res.json(results)
  } catch (err) {
    console.error('Unsplash error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
