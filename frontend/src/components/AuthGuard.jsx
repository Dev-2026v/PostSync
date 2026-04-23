import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginPage from './LoginPage'

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null  // loading
  if (!session) return <LoginPage />
  return children
}