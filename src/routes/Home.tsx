import { Link } from 'react-router-dom'

export default function Home(){
  const items = [
    { to: '/app/tickets', title: 'Tickets', desc: 'Create & track maintenance tickets' },
    { to: '/app/projects', title: 'Team Projects', desc: 'Shared project updates' },
    { to: '/app/map', title: 'Park Map', desc: 'Quick access to the park map' },
    { to: '/app/procedures', title: 'Procedures', desc: 'Everyday procedures & SOPs' },
  ]
  return (
    <div className="page-wrap">
      <div className="grid gap-6">
        {items.map(i => (
          <Link key={i.to} to={i.to} className="card block hover:shadow-lg transition-shadow">
            <div className="text-xl font-semibold">{i.title}</div>
            <div className="text-slate-500">{i.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
