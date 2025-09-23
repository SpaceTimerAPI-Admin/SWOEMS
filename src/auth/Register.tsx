import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, ADMIN_EMAIL } from '../lib/supabase'
import { Button, Card } from '../components/UI'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleRegister(e: React.FormEvent){
    e.preventDefault(); setSubmitting(true); setMessage('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error){ setMessage(error.message); setSubmitting(false); return }
    const userId = data.user?.id
    if (userId){
      await supabase.from('profiles').insert({ id: userId, email, full_name: fullName, approved: email === ADMIN_EMAIL })
    }
    setMessage('Account created! You will be able to sign in once an admin approves you.')
    setSubmitting(false)
    navigate('/')
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-sea-900 mb-2">Create your account</h2>
        <p className="text-sm text-sea-800/70 mb-4">New users must be approved before first login.</p>
        <form onSubmit={handleRegister} className="space-y-3">
          <input className="w-full rounded-xl border border-slate-300/70 px-4 py-2" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
          <input type="email" className="w-full rounded-xl border border-slate-300/70 px-4 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" className="w-full rounded-xl border border-slate-300/70 px-4 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <Button disabled={submitting} type="submit" className="w-full">{submitting? 'Creating...' : 'Register'}</Button>
        </form>
        {message && <div className="mt-3 text-sm">{message}</div>}
        <div className="mt-4 text-sm text-center">
          Already have an account? <Link to="/" className="text-sea-700 font-semibold">Sign in</Link>
        </div>
      </Card>
    </div>
  )
}
