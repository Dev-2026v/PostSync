export function withCors(handler) {
  return async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', frontendUrl)
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    try {
      return await handler(req, res)
    } catch (error) {
      console.error('API Error:', error.message)
      return res.status(500).json({ error: error.message })
    }
  }
}
