import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import TopBar from './components/TopBar'
import ErrorBoundary from './components/ErrorBoundary'

export default function App(){
  const [approved, setApproved] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((ev) => {
      if (ev === 'SIGNED_OUT') navigate('/')
    })
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/')
      const { data } = await supabase.from('profiles').select('approved').eq('id', user.id).single()
      setApproved(!!data?.approved)
      if (!data?.approved) navigate('/app')
    })()
    return () => sub.data.subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onHome={() => navigate('/app')} onSettings={() => navigate('/app')} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <ErrorBoundary>
          {approved === false && (
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
