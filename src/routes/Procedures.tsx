import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, SectionTitle } from '../components/UI'

export default function Procedures(){
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'public'|'mine'>('all')
  const [profileId, setProfileId] = useState<string>('')

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setProfileId(user?.id ?? '')
    await reload()
  })() }, [])

  async function reload(){
    setLoading(true)
    const { data } = await supabase.from('procedures').select('*').order('updated_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  async function createDoc(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f = e.currentTarget as any
    const title = f.title.value.trim()
    const content = f.content.value.trim()
    const is_public = f.is_public.checked
    await supabase.from('procedures').insert({ title, content, is_public, owner_id: profileId })
    f.reset(); await reload()
  }

  async function saveDoc(doc:any){
    await supabase.from('procedures').update({ title: doc.title, content: doc.content, is_public: doc.is_public }).eq('id', doc.id)
    await reload()
  }

  const DocCard = ({ d }: { d:any }) => {
    const [edit, setEdit] = useState(false)
    const [local, setLocal] = useState(d)
    const canEdit = d.owner_id === profileId
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-base font-semibold">{d.title}</div>
          <span className={"text-xs px-2 py-1 rounded-full border " + (d.is_public? 'bg-sea-100 text-sea-800 border-sea-200' : 'bg-slate-100 text-slate-700 border-slate-200')}>{d.is_public? 'Public' : 'Private'}</span>
        </div>
        {!edit ? (
          <>
            <div className="text-xs text-slate-500">Last updated {new Date(d.updated_at).toLocaleString()}</div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{d.content}</p>
            {canEdit && <div className="mt-3 flex gap-2"><Button onClick={()=>{setLocal(d); setEdit(true);}}>Edit</Button></div>}
          </>
        ) : (
          <div className="grid gap-2 mt-2">
            <input className="rounded-xl border px-3 py-2" value={local.title} onChange={e=>setLocal({...local, title:e.target.value})} />
            <textarea className="rounded-xl border px-3 py-2" rows={4} value={local.content} onChange={e=>setLocal({...local, content:e.target.value})} />
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={local.is_public} onChange={e=>setLocal({...local, is_public:e.target.checked})}/> Public</label>
            <div className="flex gap-2">
              <Button onClick={()=>{ saveDoc(local); setEdit(false); }}>Save</Button>
              <Button className="bg-slate-600" onClick={()=>setEdit(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  const filtered = docs.filter(d => filter==='all' ? true : filter==='public' ? d.is_public : d.owner_id===profileId)

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Create Procedure</SectionTitle>
        <form className="grid gap-3" onSubmit={createDoc}>
          <input name="title" className="rounded-xl border px-4 py-2" placeholder="Title" required />
          <textarea name="content" rows={5} className="rounded-xl border px-4 py-2" placeholder="Steps / notes" required></textarea>
          <label className="inline-flex items-center gap-2 text-sm"><input name="is_public" type="checkbox"/> Make public</label>
          <Button type="submit" className="justify-self-start">Save</Button>
        </form>
      </Card>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">Filter:</span>
        <select className="rounded-xl border px-3 py-2" value={filter} onChange={e=>setFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="public">Public</option>
          <option value="mine">My Private</option>
        </select>
      </div>

      <div className="grid gap-4">{loading? <div>Loading...</div> : filtered.map(d => <DocCard key={d.id} d={d} />)}</div>
    </div>
  )
}
