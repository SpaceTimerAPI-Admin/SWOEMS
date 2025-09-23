import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button, Card } from '../components/UI'

export default function SignIn(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSignIn(e: React.FormEvent){
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/app')
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-sea-600 grid place-items-center shadow text-white mb-3">⛑️</div>
          <h1 className="text-2xl font-bold text-sea-900">EMS Dashboard</h1>
          <p className="text-sm text-sea-800/70">Sign in to continue</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-3">
          <input type="email" className="w-full rounded-xl border border-slate-300/70 px-4 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" className="w-full rounded-xl border border-slate-300/70 px-4 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <div className="mt-4 text-sm text-center">
          New here? <Link to="/register" className="text-sea-700 font-semibold">Create an account</Link>
        </div>
      </Card>
    </div>
  )
}
