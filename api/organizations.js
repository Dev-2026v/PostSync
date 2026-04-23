import { withCors } from './lib/cors.js'
import { getOrganizations } from '../backend/services/linkedin.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { accessToken } = req.query

  if (!accessToken) {
    return res.status(400).json({ error: 'accessToken is required' })
  }

  try {
    const result = await getOrganizations(accessToken)
    res.json(result)
  } catch (err) {
    console.error('Error fetching LinkedIn organizations:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
