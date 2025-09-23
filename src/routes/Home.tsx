import { useNavigate } from 'react-router-dom'
import { Bubble } from '../components/UI'

export default function Home(){
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <div className="grid gap-3">
        <Bubble icon="🛠️" title="Tickets" subtitle="Create & track maintenance tickets" onClick={()=>nav('/app/tickets')} />
        <Bubble icon="📁" title="Team Projects" subtitle="Shared project updates" onClick={()=>nav('/app/projects')} />
        <Bubble icon="🗺️" title="Park Map" subtitle="Quick access to the park map" onClick={()=>nav('/app/map')} />
        <Bubble icon="📄" title="Procedures" subtitle="Everyday procedures • public/private" onClick={()=>nav('/app/procedures')} />
      </div>
    </div>
  )
}
