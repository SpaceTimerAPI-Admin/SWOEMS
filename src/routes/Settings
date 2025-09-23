import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, SectionTitle } from '../components/UI'

export default function Settings(){
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    if (data?.full_name) setFullName(data.full_name)
  })() }, [])

  async function save(e: React.FormEvent){
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user){
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    }
    setSaving(false)
  }

  return (
    <Card className="p-6">
      <SectionTitle>Profile Settings</SectionTitle>
      <form onSubmit={save} className="grid gap-3 max-w-md">
        <label className="text-sm">Full name</label>
        <input className="rounded-xl border px-4 py-2" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <Button disabled={saving} type="submit">{saving ? 'Saving...' : 'Save changes'}</Button>
      </form>
    </Card>
  )
}
