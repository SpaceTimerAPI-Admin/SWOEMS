import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Procedures(){
  const [procedures, setProcedures] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function load(){
    const { data, error } = await supabase.from('procedures').select('*').order('created_at',{ascending:false})
    if(error) alert(error.message)
    else setProcedures(data||[])
  }
  useEffect(()=>{ load() },[])

  async function createProcedure(){
    const { data, error } = await supabase.rpc('create_procedure', { p_title: title, p_content: content, p_public: true })
    if(error){ alert(error.message); return }
    if(data){
      setShowForm(false); setTitle(''); setContent('')
      await load()
    }
  }

  return (
    <div className="page-wrap">
      <h2 className="section-title">Procedures</h2>
      <button className="btn" onClick={()=>setShowForm(true)}>New Procedure</button>
      {showForm && (
        <div className="card">
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
          <textarea className="input" value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" />
          <button className="btn" onClick={createProcedure}>Create</button>
        </div>
      )}
      <ul className="list">
        {procedures.map(p=>(
          <li key={p.id} className="card">
            <div className="kv">{p.title}</div>
            <div className="kv">{p.public? 'Public':'Private'}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
