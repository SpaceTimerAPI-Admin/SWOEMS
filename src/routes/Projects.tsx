import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Project = { id:string; title:string; description:string|null; status:'Open'|'Closed'; created_at:string }

export default function Projects(){
  const [all, setAll] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<'all'|'Open'|'Closed'>('Open')
  const [q, setQ] = useState('')

  async function reload(){
    const { data } = await supabase.from('projects').select('id,title,description,status,created_at').order('created_at',{ascending:false})
    setAll((data as any)||[])
  }

  useEffect(()=>{ reload() }, [])

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase()
    return (all||[]).filter(p => (status==='all' || p.status===status) && (!s || JSON.stringify(p).toLowerCase().includes(s)))
  },[all,status,q])

  async function createProject(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f = e.currentTarget as any
    const title = f.title.value.trim() || '(no title)'
    const description = f.description.value.trim() || null
    await supabase.from('projects').insert({ title, description, status:'Open' })
    setShowForm(false)
    await reload()
  }

  return (
    <div className="page-wrap">
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h2 className="section-title">Team Projects</h2>
        <div className="toolbar">
          <button className="btn" onClick={()=>setShowForm(true)}>New Project</button>
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
            <input placeholder="search projects" value={q} onChange={e=>setQ(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="grid gap-4" style={{marginTop:12}}>
        {filtered.map(p => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{p.title}</div>
                <div className="kv">{new Date(p.created_at).toLocaleString()}</div>
              </div>
              <span className={\`badge \${p.status==='Open'?'open':'closed'}\`}>{p.status}</span>
            </div>
            {p.description && <p className="mt-2">{p.description}</p>}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="lightbox" onClick={()=>setShowForm(false)}>
          <div className="card" style={{width:'min(800px,95vw)'}} onClick={e=>e.stopPropagation()}>
            <h3 className="section-title">New Project</h3>
            <form className="grid gap-3" onSubmit={createProject}>
              <label>Title <input name="title" required /></label>
              <label>Description <textarea name="description" rows={3}></textarea></label>
              <div className="row">
                <div style={{flex:1}} />
                <button className="btn" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
