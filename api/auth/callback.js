import { withCors } from '../../lib/cors.js'
import { getAccessToken, getProfile } from '../../backend/services/linkedin.js'
import { supabase } from '../../backend/config/supabase.js'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, error } = req.query

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`)
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`)
  }

  try {
    const tokenData = await getAccessToken(code)
    const profile = await getProfile(tokenData.access_token)

    const rawId = profile.sub || ''
    const userId = rawId.includes('urn:li:person:')
      ? rawId.replace('urn:li:person:', '')
      : rawId

    // Save session to Supabase (serverless-friendly)
    await supabase
      .from('sessions')
      .upsert({
        user_id: userId,
        user_data: {
          id: userId,
          name: profile.name,
          picture: profile.picture,
          accessToken: tokenData.access_token,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    const params = new URLSearchParams({
      auth: 'success',
      userId,
      name: profile.name,
      picture: profile.picture || '',
      token: tokenData.access_token,
    })

    res.redirect(`${process.env.FRONTEND_URL}?${params}`)
  } catch (err) {
    console.error('Auth callback error:', err.message)
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`)
  }
}

export default withCors(handler)
