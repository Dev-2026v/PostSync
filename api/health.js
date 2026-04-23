import { withCors } from './lib/cors.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.json({ status: 'ok', timestamp: new Date().toISOString() })
}

export default withCors(handler)
