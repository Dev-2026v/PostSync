import { withCors } from '../../lib/cors.js'

const SCOPES = ['openid', 'profile', 'w_member_social', 'r_organization_social', 'rw_organization_admin', 'w_organization_social'].join(' ')

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      scope: SCOPES,
      state: 'random_state_string',
    })
    
    res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default withCors(handler)
