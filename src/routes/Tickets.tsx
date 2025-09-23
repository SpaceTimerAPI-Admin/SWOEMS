import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, SectionTitle } from '../components/UI'
import { useNavigate } from 'react-router-dom'

export default function Tickets(){
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [teamTickets, setTeamTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const nav = useNavigate()

  async function reload(){
    const { data: { user } } = await supabase.auth.getUser()
    const me = user?.id ?? ''
    const sel = 'id, title, description, status, created_at, owner:profiles(id, full_name, email), photo_url'
    const { data: mine } = await supabase.from('tickets').select(sel).eq('owner_id', me).order('created_at', { ascending: false })
    const { data: others } = await supabase.from('tickets').select(sel).neq('owner_id', me).order('created_at', { ascending: false })
    setMyTickets(mine || [])
    setTeamTickets(others || [])
  }

  useEffect(() => { (async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setProfileId(user?.id ?? null)
    await reload()
    setLoading(false)
  })() }, [])

  async function createTicket(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const form = e.currentTarget as any
    const title = form.title.value.trim()
    const description = form.description.value.trim()

    let photo_url: string | null = null
    const file = form.photo.files?.[0]
    if (file && profileId){
      const path = `${profileId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('ticket-photos').upload(path, file)
      if (!error){
        const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    const { data, error } = await supabase.from('tickets')
      .insert({ title, description, status: 'Open', owner_id: profileId, photo_url })
      .select('id')
      .single()

    if (error) { console.error(error); return }
    form.reset()
    await reload()              // auto-refresh list
    nav(`/app/tickets/${data!.id}`) // open the ticket just created
  }

  const Item = ({ t }: { t:any }) => (
    <Card className="p-4 hover:shadow-md cursor-pointer" onClick={()=>nav(`/app/tickets/${t.id}`)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{t.title}</div>
          <div className="text-xs text-slate-500">By {t.owner?.full_name || t.owner?.email} • {new Date(t.created_at).toLocaleString()}</div>
        </div>
        <span className={"px-3 py-1 rounded-full text-xs border " + (t.status==='Open'?'bg-sea-100 text-sea-800 border-sea-200':'bg-slate-100 text-slate-700 border-slate-300')}>{t.status}</span>
      </div>
      {t.photo_url && <img src={t.photo_url} alt="" className="mt-3 w-full max-h-48 object-cover rounded-xl" />}
      {t.description && <p className="mt-3 text-sm line-clamp-3">{t.description}</p>}
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Create Ticket</SectionTitle>
        <form className="grid gap-3" onSubmit={createTicket}>
          <input name="title" className="rounded-xl border px-4 py-2" placeholder="Title" required />
          <textarea name="description" className="rounded-xl border px-4 py-2" placeholder="Description" rows={3}></textarea>
          <input name="photo" type="file" accept="image/*" capture="environment" className="rounded-xl border px-4 py-2" />
          <Button type="submit" className="justify-self-start">Submit Ticket</Button>
        </form>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <SectionTitle>My Tickets</SectionTitle>
          <div className="grid gap-4">{loading? <div>Loading...</div> : myTickets.map(t => <Item key={t.id} t={t} />)}</div>
        </div>
        <div>
          <SectionTitle>Team Tickets</SectionTitle>
          <div className="grid gap-4">{loading? <div>Loading...</div> : teamTickets.map(t => <Item key={t.id} t={t} />)}</div>
        </div>
      </div>
    </div>
  )
}
