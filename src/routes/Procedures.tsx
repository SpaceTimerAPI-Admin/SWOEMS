import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

type Proc = { id:string; title:string; is_public:boolean; created_at:string }

export default function Procedures(){
  const [all, setAll] = useState<Proc[]>([])
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef<HTMLInputElement|null>(null)

  async function reload(){
    const { data, error } = await supabase.from('procedures').select('id,title,is_public,created_at').order('created_at',{ascending:false})
    if (error){ alert('Load procedures failed: '+error.message); return }
    setAll((data as any)||[])
  }

  useEffect(()=>{ reload() }, [])
  useEffect(()=>{ if(showForm){ setTimeout(()=>titleRef.current?.focus(),50) }}, [showForm])

  const filtered = useMemo(()=>{
    const s=q.trim().toLowerCase()
    return all.filter(p => !s || p.title.toLowerCase().includes(s))
  },[all,q])

  async function createProc(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try{
      const f = e.currentTarget as any
      const title = f.title.value.trim()
      const content = f.content.value.trim()
      const { data, error } = await supabase.from('procedures').insert({ title, content, is_public: isPublic }).select('id').single()
      if (error) throw error
      const id = data!.id as string
      setAll(prev => [{ id, title, is_public:isPublic, created_at:new Date().toISOString() }, ...prev])
      f.reset(); setIsPublic(false); setShowForm(false); setSubmitting(false)
    }catch(err:any){
      alert('Create procedure failed: ' + (err?.message || JSON.stringify(err)))
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrap">
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h2 className="section-title">Procedures</h2>
        <div className="toolbar">
          <button className="btn" onClick={()=>setShowForm(true)}>New Procedure</button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <label>Search <input placeholder="search procedures" value={q} onChange={e=>setQ(e.target.value)} /></label>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <table className="w-full text-sm">
          <thead>
            <tr><th className="text-left p-2">Title</th><th className="text-left p-2">Visibility</th><th className="text-left p-2">Created</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.title}</td>
                <td className="p-2">{p.is_public ? 'Public' : 'Private'}</td>
                <td className="p-2">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!filtered.length && <tr><td className="p-4 text-slate-500" colSpan={3}>No procedures yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="lightbox" onClick={()=>setShowForm(false)}>
          <div className="card" style={{width:'min(800px,95vw)'}} onClick={e=>e.stopPropagation()}>
            <h3 className="section-title">New Procedure</h3>
            <form className="grid gap-3" onSubmit={createProc}>
              <label>Title <input name="title" ref={titleRef} required /></label>
              <label>Content <textarea name="content" rows={6} required></textarea></label>
              <label style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} /> Make public
              </label>
              <div className="row">
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
