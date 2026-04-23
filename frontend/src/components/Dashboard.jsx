import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import URLInput from './URLInput'
import PostCard from './PostCard'
import RegenControls from './RegenControls'
import RegenCard from './RegenCard'
import LinkedInConnect from './LinkedInConnect'
import PublishPanel from './PublishPanel'
import ImagePickerPanel from './ImagePickerPanel'
import { API_URL } from '../api'

export default function Dashboard() {
  const [postData, setPostData] = useState(null)
  const [regenData, setRegenData] = useState(null)
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [error, setError] = useState(null)
  const [linkedInUser, setLinkedInUser] = useState(null)  // LinkedIn only, in memory
  const [attachedImage, setAttachedImage] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {})

    // Pick up LinkedIn token from OAuth redirect — then immediately wipe it from URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'success') {
      setLinkedInUser({
        id: params.get('userId'),
        name: params.get('name'),
        picture: params.get('picture'),
        accessToken: params.get('token'),
      })
      window.history.replaceState({}, '', '/')  // wipe token from URL immediately
    }
    // No localStorage read — LinkedIn state is session-only
  }, [])

  const handleLinkedInLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    setLinkedInUser(null)  // clears from memory only — nothing to wipe from disk
  }

  const handleSignOut = async () => {
    // 1. Clear LinkedIn session on backend
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})

    // 2. Sign out of Supabase — clears its in-memory token
    await supabase.auth.signOut()

    // 3. AuthGuard re-renders to LoginPage automatically via onAuthStateChange
    // No localStorage.clear() needed — nothing was ever written
  }

  const handleScrape = async (url) => {
    setScrapeLoading(true)
    setError(null)
    setPostData(null)
    setRegenData(null)
    setAttachedImage(null)
    try {
      const res = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPostData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setScrapeLoading(false)
    }
  }

  const handleRegen = async (overrideContent = null) => {
    setRegenLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/regen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: overrideContent || postData.content,
          tone,
          length,
          regenerateImage: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegenData(data)
      setAttachedImage(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setRegenLoading(false)
    }
  }

  return (
    <div className="max-w-full md:h-dvh flex flex-col bg-blue-200 py-6 px-6 m-5 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="mb-4 shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            LinkedIn Post Reposter
          </h1>
          <p className="text-sm text-gray-500">
            Paste a LinkedIn post URL to scrape, rewrite and repost it.
          </p>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-300 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors duration-150 shrink-0 ml-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>

      {/* LinkedIn connect */}
      <div className="mb-3 shrink-0">
        <LinkedInConnect user={linkedInUser} onLogout={handleLinkedInLogout} />
      </div>

      {/* URL Input */}
      <div className="mb-3 shrink-0">
        <URLInput onScrape={handleScrape} loading={scrapeLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 shrink-0 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main grid */}
      <div className='flex-1 min-h-0 overflow-hidden'>
        <div className={`h-full grid gap-5 ${postData ? 'flex flex-col md:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="min-h-0 max-h-100 md:max-h-full overflow-y-auto scrollbar-thin">
            {postData && <PostCard data={postData} />}
          </div>

          {postData && (
            <div className="min-h-0 max-h-100 md:max-h-full overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-4">
              <div>
                <RegenControls
                  tone={tone}
                  length={length}
                  onToneChange={setTone}
                  onLengthChange={setLength}
                  onRegen={() => handleRegen()}
                  loading={regenLoading}
                />
              </div>
              <div className="shrink-0">
                {regenData && (
                  <RegenCard data={regenData} onRegenContent={handleRegen} loading={regenLoading} />
                )}
              </div>
              <div className="shrink-0">
                {regenData && (
                  <ImagePickerPanel postContent={regenData.content} onImageChange={setAttachedImage} />
                )}
              </div>
              <div className="shrink-0">
                {regenData && (
                  <PublishPanel regenData={regenData} attachedImage={attachedImage} user={linkedInUser} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}