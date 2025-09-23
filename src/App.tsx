import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, ADMIN_EMAIL } from './lib/supabase'
import TopBar from './components/TopBar'
import ErrorBoundary from './components/ErrorBoundary'

export default function App(){
  const [approved, setApproved] = useState<boolean | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const navigate = useNavigate()
  const loc = useLocation()

  async function refreshApproval(){
    const { data: { user } } = await supabase.auth.getUser()
    if (!user){ navigate('/'); return }
    setEmail(user.email ?? null)
    const { data, error } = await supabase.from('profiles')
      .select('approved').eq('id', user.id).single()
    if (error) console.warn('profiles fetch error', error)
    setApproved(!!data?.approved)
  }

  useEffect(() => {
    refreshApproval()
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshApproval())
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showBanner = approved === false && email !== ADMIN_EMAIL

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onHome={() => navigate('/app')} onSettings={() => navigate('/app/settings')} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <ErrorBoundary>
          {showBanner && (
            <div className="mb-4 rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
              Your account is pending approval by an administrator.
            </div>
          )}
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
