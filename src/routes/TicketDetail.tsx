import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function TicketDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [ticket, setTicket] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [profileId, setProfileId] = useState<string>('')

  async function load(){
    const sel = 'id,title,description,status,priority,location,category,date,photo_url,conclusion,created_at,owner:profiles(id,full_name,email)'
    const { data: t } = await supabase.from('tickets').select(sel).eq('id', id).single()
    setTicket(t || null)
    const { data: u } = await supabase.from('ticket_updates').select('id,note,created_at').eq('ticket_id', id).order('created_at', { ascending: true })
    setUpdates(u || [])
    const { data: a } = await supabase.from('ticket_attachments').select('id,name,photo_url,created_at').eq('ticket_id', id).order('created_at', { ascending: true })
    setAttachments(a || [])
  }

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setProfileId(user?.id ?? '')
    await load()
  })() }, [id])

  async function addUpdate(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const txt = (e.currentTarget as any).uText.value.trim()
    if(!txt){ alert('Enter update text.'); return }
    await supabase.from('ticket_updates').insert({ ticket_id: id, note: txt })
    ;(e.currentTarget as any).reset()
    await load()
  }

  async function addPhoto(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f || !profileId) return
    const path = `${profileId}/att-${Date.now()}-${f.name}`
    const up = await supabase.storage.from('ticket-photos').upload(path, f)
    if (!up.error){
      const { data } = supabase.storage.from('ticket-photos').getPublicUrl(path)
      await supabase.from('ticket_attachments').insert({ ticket_id: id, name: f.name, photo_url: data.publicUrl })
      await load()
    }
  }

  async function toggleStatus(){
    if(!ticket) return
    if(ticket.status === 'Closed'){
      await supabase.from('tickets').update({ status: 'Open', conclusion: null }).eq('id', ticket.id)
      await load()
      return
    }
    const conclusion = prompt('Enter a short conclusion to close this ticket (required):')
    if(!conclusion || !conclusion.trim()){ alert('Conclusion is required to close.'); return }
    await supabase.from('tickets').update({ status: 'Closed', conclusion: conclusion.trim() }).eq('id', ticket.id)
    await supabase.from('ticket_updates').insert({ ticket_id: id, note: 'Ticket closed. Conclusion: ' + conclusion.trim() })
    await load()
  }

  if (!ticket) return <div className="page-wrap"><div className="notice">Loading…</div></div>

  return (
    <div className="page-wrap">
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h2 className="section-title">Ticket #{ticket.id?.slice(0,8)}</h2>
        <div className="toolbar">
          <button className="btn small" onClick={()=>nav('/app/tickets')}>Back</button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div className="meta">
            <div><b>{ticket.title}</b></div>
            <div className={`${ticket.status==='Open'?'badge open':'badge closed'}`}>{ticket.status}</div>{' '}
            <span className="badge prio">{ticket.priority}</span>
            <div className="kv">Date: <b>{ticket.date ? new Date(ticket.date).toLocaleString() : ''}</b></div>
            <div className="kv">Location: <b>{ticket.location || '—'}</b></div>
            <div className="kv">Category: <b>{ticket.category || '—'}</b></div>
          </div>
          <div style={{flex:1}}>
            <div><b>Description</b><br />{ticket.description || '—'}</div>
            <hr />
            <div><b>Updates (Paper Trail)</b></div>
            <div className="list">
              {updates.length ? updates.map(u=>(
                <div key={u.id} className="card" style={{padding:'10px'}}>
                  <div className="kv">{new Date(u.created_at).toLocaleString()}</div>
                  <div>{u.note}</div>
                </div>
              )) : <div className="notice">No updates yet.</div>}
            </div>

            <form className="row" style={{marginTop:10}} onSubmit={addUpdate}>
              <textarea name="uText" placeholder="Add update..." rows={2} />
              <button className="btn small" type="submit">Add Update</button>
              <div style={{flex:1}} />
              <button className="btn small" type="button" onClick={toggleStatus}>
                {ticket.status === 'Open' ? 'Close Ticket' : 'Reopen Ticket'}
              </button>
            </form>

            {ticket.status==='Closed' && ticket.conclusion ? (
              <>
                <hr />
                <div><b>Conclusion</b><br />{ticket.conclusion}</div>
              </>
            ) : null}

            <hr />
            <div className="row" style={{alignItems:'center'}}>
              <div>
                <b>Attachments</b>
                <div className="notice">Use camera or upload from files.</div>
              </div>
              <div style={{textAlign:'right'}}>
                <label className="btn small">Add Photo
                  <input type="file" accept="image/*" capture="environment" onChange={addPhoto} style={{display:'none'}} />
                </label>
              </div>
            </div>

            <div className="thumbgrid" style={{marginTop:10}}>
              {attachments.length ? attachments.map((a:any)=>(
                <div key={a.id} className="thumb">
                  <img src={a.photo_url} alt={a.name||'photo'} onClick={()=>openLightbox(a.photo_url)} />
                </div>
              )) : <div className="notice">No photos yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function openLightbox(src:string){
  const overlay=document.createElement('div'); overlay.className='lightbox'
  overlay.innerHTML=`<img src="${src}">`
  overlay.addEventListener('click',()=>overlay.remove())
  document.body.appendChild(overlay)
}
