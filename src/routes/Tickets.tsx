import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, SectionTitle } from '../components/UI'

export default function Tickets(){
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [teamTickets, setTeamTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => { (async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    setProfileId(user?.id ?? null)
    const { data: mine } = await supabase.from('tickets').select('*, ticket_updates(*), owner:profiles(id, full_name, email)').eq('owner_id', user?.id ?? '').order('created_at', { ascending: false })
    const { data: others } = await supabase.from('tickets').select('*, ticket_updates(*), owner:profiles(id, full_name, email)').neq('owner_id', user?.id ?? '').order('created_at', { ascending: false })
    setMyTickets(mine || [])
    setTeamTickets(others || [])
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
    await supabase.from('tickets').insert({ title, description, status: 'Open', owner_id: profileId, photo_url })
    form.reset(); await reload()
  }

  async function addUpdate(ticket_id: string, note: string){
    await supabase.from('ticket_updates').insert({ ticket_id, note })
    await reload()
  }

  async function toggleStatus(ticket: any){
    const next = ticket.status === 'Open' ? 'Closed' : 'Open'
    await supabase.from('tickets').update({ status: next }).eq('id', ticket.id)
    await reload()
  }

  async function reload(){
    const { data: { user } } = await supabase.auth.getUser()
    const { data: mine } = await supabase.from('tickets').select('*, ticket_updates(*), owner:profiles(id, full_name, email)').eq('owner_id', user?.id ?? '')
    const { data: others } = await supabase.from('tickets').select('*, ticket_updates(*), owner:profiles(id, full_name, email)').neq('owner_id', user?.id ?? '')
    setMyTickets(mine || [])
    setTeamTickets(others || [])
  }

  const TicketCard = ({ t }: { t:any }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{t.title}</div>
          <div className="text-xs text-slate-500">By {t.owner?.full_name || t.owner?.email} • {new Date(t.created_at).toLocaleString()}</div>
        </div>
        <Button onClick={()=>toggleStatus(t)} className={t.status === 'Open' ? 'bg-sea-600' : 'bg-slate-600'}>
          {t.status}
        </Button>
      </div>
      {t.photo_url && <img src={t.photo_url} alt="ticket" className="mt-3 w-full max-h-64 object-cover rounded-xl"/>}
      <p className="mt-3 text-sm whitespace-pre-wrap">{t.description}</p>
      <SectionTitle>Updates</SectionTitle>
      <div className="space-y-2 max-h-40 overflow-auto">
        {(t.ticket_updates||[]).map((u:any) => (
          <div key={u.id} className="text-sm p-2 rounded-lg bg-white border">
            <div className="text-xs text-slate-500">{new Date(u.created_at).toLocaleString()}</div>
            <div>{u.note}</div>
          </div>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={async e=>{e.preventDefault(); const f=e.currentTarget as any; const note=f.note.value; if(note){ await addUpdate(t.id, note); f.reset(); }}}>
        <input name="note" className="flex-1 rounded-xl border px-3 py-2" placeholder="Add update..." />
        <Button type="submit">Add</Button>
      </form>
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
          <div className="grid gap-4">{loading? <div>Loading...</div> : myTickets.map(t => <TicketCard key={t.id} t={t} />)}</div>
        </div>
        <div>
          <SectionTitle>Team Tickets</SectionTitle>
          <div className="grid gap-4">{loading? <div>Loading...</div> : teamTickets.map(t => <TicketCard key={t.id} t={t} />)}</div>
        </div>
      </div>
    </div>
  )
}
