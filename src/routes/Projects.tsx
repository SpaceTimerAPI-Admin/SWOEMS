import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Card, SectionTitle } from '../components/UI'

export default function Projects(){
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { reload() }, [])

  async function reload(){
    setLoading(true)
    const { data } = await supabase.from('projects').select('*, project_updates(*)').order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function createProject(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    const form = e.currentTarget as any
    const title = form.title.value.trim()
    const description = form.description.value.trim()
    await supabase.from('projects').insert({ title, description, status: 'Open' })
    form.reset(); await reload()
  }

  async function addUpdate(project_id: number, note: string){
    await supabase.from('project_updates').insert({ project_id, note })
    await reload()
  }

  async function toggleStatus(project: any){
    const next = project.status === 'Open' ? 'Closed' : 'Open'
    await supabase.from('projects').update({ status: next }).eq('id', project.id)
    await reload()
  }

  const ProjectCard = ({ p }: { p:any }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">{p.title}</div>
          <div className="text-xs text-slate-500">{new Date(p.created_at).toLocaleString()}</div>
        </div>
        <Button onClick={()=>toggleStatus(p)} className={p.status === 'Open' ? 'bg-sea-600' : 'bg-slate-600'}>
          {p.status}
        </Button>
      </div>
      <p className="mt-3 text-sm whitespace-pre-wrap">{p.description}</p>
      <SectionTitle>Updates</SectionTitle>
      <div className="space-y-2 max-h-40 overflow-auto">
        {(p.project_updates||[]).map((u:any) => (
          <div key={u.id} className="text-sm p-2 rounded-lg bg-white border">
            <div className="text-xs text-slate-500">{new Date(u.created_at).toLocaleString()}</div>
            <div>{u.note}</div>
          </div>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={async e=>{e.preventDefault(); const f=e.currentTarget as any; const note=f.note.value; if(note){ await addUpdate(p.id, note); f.reset(); }}}>
        <input name="note" className="flex-1 rounded-xl border px-3 py-2" placeholder="Add update..." />
        <Button type="submit">Add</Button>
      </form>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Create Project</SectionTitle>
        <form className="grid gap-3" onSubmit={createProject}>
          <input name="title" className="rounded-xl border px-4 py-2" placeholder="Title" required />
          <textarea name="description" className="rounded-xl border px-4 py-2" placeholder="Description" rows={3}></textarea>
          <Button type="submit" className="justify-self-start">Add Project</Button>
        </form>
      </Card>
      <div className="grid gap-4">{loading? <div>Loading...</div> : projects.map(p => <ProjectCard key={p.id} p={p} />)}</div>
    </div>
  )
}
