import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button, Card, SectionTitle } from '../components/UI'

export default function TicketDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [ticket, setTicket] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [profileId, setProfileId] = useState<string>('')

  async function load(){
    const sel = 'id, title, description, status, created_at, photo_url, owner:profiles(id, full_name, email)'
    const { data: t } = await supabase.from('tickets').select(sel).eq('id', id).single()
    setTicket(t || null)
    const { data: c } = await supabase.from('ticket_comments')
      .select('id, body, photo_url, created_at, author:profiles(id, full_name, email)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })
    setComments(c || [])
  }

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setProfileId(user?.id ?? '')
    await load()
  })() }, [id])

  async function addComment(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const form: any = e.currentTarget
    const body = form.body.value.trim()
    let photo_url: string | null = null
    const file = form.photo.files?.[0]
    if (file && profileId){
      const path = `${profileId}/comment-${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('ticket-photos').upload(path, file)
      if (!error){
        const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }
    await supabase.from('ticket_comments').insert({ ticket_id: id, author_id: profileId, body, photo_url })
    form.reset()
    await load()
  }

  async function toggleStatus(){
    if (!ticket) return
    const next = ticket.status === 'Open' ? 'Closed' : 'Open'
    await supabase.from('tickets').update({ status: next }).eq('id', ticket.id)
    await load()
  }

  if (!ticket) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <Button onClick={()=>nav('/app/tickets')} className="bg-slate-700">← Back to Tickets</Button>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">{ticket.title}</div>
            <div className="text-xs text-slate-500">By {ticket.owner?.full_name || ticket.owner?.email} • {new Date(ticket.created_at).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={"px-3 py-1 rounded-full text-xs border " + (ticket.status==='Open'?'bg-sea-100 text-sea-800 border-sea-200':'bg-slate-100 text-slate-700 border-slate-300')}>{ticket.status}</span>
            <Button onClick={toggleStatus}>{ticket.status === 'Open' ? 'Close Ticket' : 'Reopen Ticket'}</Button>
          </div>
        </div>
        {ticket.photo_url && <img src={ticket.photo_url} alt="" className="mt-3 w-full max-h-64 object-cover rounded-xl" />}
        {ticket.description && <p className="mt-3 text-sm whitespace-pre-wrap">{ticket.description}</p>}
      </Card>

      <div>
        <SectionTitle>Comments</SectionTitle>
        <div className="grid gap-3">
          {comments.map(c => (
            <Card key={c.id} className="p-3">
              <div className="text-xs text-slate-500 mb-1">
                {c.author?.full_name || c.author?.email} • {new Date(c.created_at).toLocaleString()}
              </div>
              {c.body && <p className="text-sm whitespace-pre-wrap">{c.body}</p>}
              {c.photo_url && <img src={c.photo_url} alt="" className="mt-2 max-h-64 rounded-lg border object-cover" />}
            </Card>
          ))}
        </div>

        <Card className="p-4 mt-4">
          <form className="grid gap-3" onSubmit={addComment}>
            <textarea name="body" rows={3} className="rounded-xl border px-4 py-2" placeholder="Add a comment..."></textarea>
            <input type="file" name="photo" accept="image/*" capture="environment" className="rounded-xl border px-4 py-2" />
            <Button type="submit" className="justify-self-start">Post Comment</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
