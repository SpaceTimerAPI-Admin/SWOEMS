import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

type Ticket = {
  id: string
  title: string
  description: string | null
  status: 'Open' | 'Closed'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  location: string | null
  category: string | null
  date: string
  photo_url: string | null
  created_at: string
  owner_id?: string
}

function toLocalInput(dt: Date){
  const pad = (n:number)=> String(n).padStart(2,'0')
  const y = dt.getFullYear()
  const m = pad(dt.getMonth()+1)
  const d = pad(dt.getDate())
  const hh = pad(dt.getHours())
  const mm = pad(dt.getMinutes())
  return `${y}-${m}-${d}T${hh}:${mm}`
}

export default function Tickets(){
  const [all, setAll] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [status, setStatus] = useState<'all'|'Open'|'Closed'>('all')
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [defaultWhen, setDefaultWhen] = useState<string>(toLocalInput(new Date()))
  const [submitting, setSubmitting] = useState(false)
  const nav = useNavigate()
  const titleRef = useRef<HTMLInputElement|null>(null)

  async function reload(){
    const sel = 'id,title,description,status,priority,location,category,date,photo_url,created_at,owner_id'
    const { data, error } = await supabase.from('tickets').select(sel).order('created_at', { ascending: false })
    if (error) {
      console.error('select tickets', error)
      alert('Error loading tickets: ' + (error.message || JSON.stringify(error)))
      return
    }
    setAll((data as any) || [])
  }

  useEffect(() => { (async () => {
    setLoading(true)
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) console.error('getUser error', error)
    setProfileId(user?.id ?? null)
    await reload()
    setLoading(false)
  })() }, [])

  useEffect(() => {
    if (showForm){
      setDefaultWhen(toLocalInput(new Date()))
      setTimeout(()=> titleRef.current?.focus(), 50)
    }
  }, [showForm])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return all.filter(t =>
      (status === 'all' || t.status === status) &&
      (!s || JSON.stringify(t).toLowerCase().includes(s))
    )
  }, [all, status, q])

  async function createTicket(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try{
      const f = e.currentTarget as any
      const title = f.title.value.trim() || '(no title)'
      const location = f.location.value.trim() || null
      const category = f.category.value.trim() || null
      const priority = f.priority.value as Ticket['priority']
      const dateLocal = f.date.value || defaultWhen
      const dateISO = new Date(dateLocal).toISOString()
      const description = f.description.value.trim() || null

      let uid = profileId
      if (!uid){
        const { data: { user } } = await supabase.auth.getUser()
        uid = user?.id ?? null
        setProfileId(uid)
      }
      if (!uid){ alert('Not signed in.'); setSubmitting(false); return }

      // Upload optional photo
      let photo_url: string | null = null
      const file = f.photo.files?.[0]
      if (file){
        const path = `${uid}/${Date.now()}-${file.name}`
        const up = await supabase.storage.from('ticket-photos').upload(path, file)
        if (up.error){
          console.error('upload error', up.error)
          alert('Photo upload failed: ' + (up.error.message || JSON.stringify(up.error)))
        } else {
          const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path)
          photo_url = data.publicUrl
        }
      }

      // Insert and return the new row
      const { data, error } = await supabase.from('tickets')
        .insert({ title, location, category, priority, date: dateISO, description, status: 'Open', owner_id: uid, photo_url })
        .select('id,title,description,status,priority,location,category,date,photo_url,created_at,owner_id')
        .single()

      if (error){
        console.error('insert tickets error', error)
        alert('Create failed: ' + (error.message || JSON.stringify(error)))
        setSubmitting(false)
        return
      }

      // Optimistic add to list so user sees it immediately
      setAll(prev => [data as any, ...prev])
      f.reset()
      setShowForm(false)
      setSubmitting(false)
      nav(`/app/tickets/${data!.id}`)
    } catch(err:any){
      console.error('createTicket fatal', err)
      alert(err?.message || 'Failed to create ticket')
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrap">
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h2 className="section-title">Tickets</h2>
        <div className="toolbar">
          <button className="btn" onClick={()=>setShowForm(true)}>New Ticket</button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <label>Status
            <select value={status} onChange={e=>setStatus(e.target.value as any)}>
              <option value="all">All</option>
              <option>Open</option>
              <option>Closed</option>
            </select>
          </label>
          <label>Search
            <input placeholder="text, location, category" value={q} onChange={e=>setQ(e.target.value)} />
          </label>
        </div>
      </div>

      <div id="list" className="list" style={{marginTop:12}}>
        {loading ? <div className="notice">Loading...</div> :
          (filtered.length ? filtered.map(t => <Row key={t.id} t={t} onOpen={()=>nav('/app/tickets/'+t.id)} />) : <div className="notice">No tickets yet.</div>)}
      </div>

      {showForm && (
        <div className="lightbox" onClick={()=>setShowForm(false)}>
          <div className="card" style={{width:'min(900px,95vw)'}} onClick={e=>e.stopPropagation()}>
            <h3 className="section-title">New Ticket</h3>
            <form className="grid gap-3" onSubmit={createTicket}>
              <div className="row">
                <label>Title <input name="title" ref={titleRef} required /></label>
                <label>Priority
                  <select name="priority" defaultValue="Low">
                    {['Low','Medium','High','Critical'].map(p=> <option key={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <div className="row">
                <label>Location <input name="location" /></label>
                <label>Category
                  <select name="category" defaultValue="General">
                    {['General','Electrical','Plumbing','Ride','Show/Venue','Safety'].map(c=> <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <label>Date/Time <input name="date" type="datetime-local" defaultValue={defaultWhen} /></label>
              <label>Description <textarea name="description" rows={3}></textarea></label>
              <div className="row" style={{marginTop:10}}>
                <label className="btn small">Add Photo
                  <input type="file" name="photo" accept="image/*" capture="environment" style={{display:'none'}} />
                </label>
                <div style={{flex:1}} />
                <button className="btn" type="submit" disabled={submitting}>{submitting?'Creating...':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ t, onOpen }:{ t:Ticket; onOpen:()=>void }){
  return (
    <div className="card ticketRow" onClick={onOpen} style={{cursor:'pointer'}}>
      <div className="meta">
        <div><b>{t.title || '(no title)'}</b></div>
        <div className="kv">#{t.id?.slice(0,8)} • {new Date(t.created_at).toLocaleString()}</div>
        <div className={`badge ${t.status==='Open'?'open':'closed'}`}>{t.status}</div>{' '}
        <span className="badge prio">{t.priority}</span>
      </div>
      <div style={{flex:1}}>
        <div>{t.description || ''}</div>
        <div className="kv"><b>Loc:</b> {t.location || '—'} &nbsp; <b>Cat:</b> {t.category || '—'}</div>
      </div>
      <div><button className="btn small" onClick={(e)=>{e.stopPropagation(); onOpen();}}>Open</button></div>
    </div>
  )
}
