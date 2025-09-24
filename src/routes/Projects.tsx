import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Projects(){
  const [projects, setProjects] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  async function load(){
    const { data, error } = await supabase.from('projects').select('*').order('created_at',{ascending:false})
    if(error) alert(error.message)
    else setProjects(data||[])
  }
  useEffect(()=>{ load() },[])

  async function createProject(){
    const { data, error } = await supabase.rpc('create_project', { p_title: title, p_description: desc })
    if(error){ alert(error.message); return }
    if(data){
      setShowForm(false); setTitle(''); setDesc('')
      await load()
    }
  }

  return (
    <div className="page-wrap">
      <h2 className="section-title">Projects</h2>
      <button className="btn" onClick={()=>setShowForm(true)}>New Project</button>
      {showForm && (
        <div className="card">
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
          <textarea className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
          <button className="btn" onClick={createProject}>Create</button>
        </div>
      )}
      <ul className="list">
        {projects.map(p=>(
          <li key={p.id} className="card">
            <div className="kv">{p.title}</div>
            <div className="kv">{p.description}</div>
            <div className="kv">{p.status}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
