import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Tickets(){
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const navigate = useNavigate()

  async function load(){
    const { data, error } = await supabase.from('tickets').select('*').order('created_at',{ascending:false})
    if(error) alert(error.message)
    else setTickets(data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  async function createTicket(){
    const { data, error } = await supabase.rpc('create_ticket', {
      p_title: title,
      p_description: desc,
      p_priority: 'Low',
      p_location: '',
      p_category: '',
      p_date: new Date().toISOString(),
      p_photo_url: null
    })
    if(error){ alert(error.message); return }
    if(data){
      setShowForm(false); setTitle(''); setDesc('')
      await load()
      navigate(`/app/tickets/${data}`)
    }
  }

  return (
    <div className="page-wrap">
      <h2 className="section-title">Tickets</h2>
      <button className="btn" onClick={()=>setShowForm(true)}>New Ticket</button>
      {showForm && (
        <div className="card">
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
          <textarea className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
          <button className="btn" onClick={createTicket}>Create</button>
        </div>
      )}
      {loading? <p>Loading...</p> : (
        <ul className="list">
          {tickets.map(t=>(
            <li key={t.id} className="card">
              <div className="kv">{t.title}</div>
              <div className="kv">{t.status}</div>
              <div className="kv">{new Date(t.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
