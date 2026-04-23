import { withCors } from './lib/cors.js'
import { scrapeLinkedInPost } from '../backend/services/playwright.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url || !url.includes('linkedin.com/posts')) {
    return res.status(400).json({ error: 'Please provide a valid LinkedIn post URL' })
  }

  try {
    const result = await scrapeLinkedInPost(url)

    if (!result.success) {
      return res.status(500).json({ error: result.error })
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
