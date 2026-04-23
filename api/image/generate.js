import { withCors } from '../lib/cors.js'
import { generateImage, buildImagePrompt } from '../../backend/services/imageGen.js'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, postContent } = req.body

  if (!prompt && !postContent) {
    return res.status(400).json({ error: 'prompt or postContent required' })
  }

  try {
    const finalPrompt = prompt || await buildImagePrompt(postContent)
    console.log('Generating image for prompt:', finalPrompt.slice(0, 80))

    const result = await generateImage(finalPrompt)

    if (!result) {
      return res.status(500).json({ error: 'All generators failed' })
    }

    res.json({
      url: result.url,
      previewUrl: result.previewUrl,
      base64: result.base64,
      mimeType: result.mimeType,
    })
  } catch (err) {
    console.error('Image generation error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export default withCors(handler)
