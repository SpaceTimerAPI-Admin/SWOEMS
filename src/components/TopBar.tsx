import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ onHome, onSettings }:{ onHome:()=>void; onSettings:()=>void }){
  const navigate = useNavigate()
  return (
    <div className="w-full sticky top-0 z-10 bg-sea-800/90 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="#" onClick={(e)=>{ e.preventDefault(); onHome(); }} className="text-white font-semibold text-xl tracking-wide">EMS Dashboard</a>
        <div className="flex items-center gap-3">
          <button aria-label="Settings" onClick={onSettings} className="text-white/90 hover:text-white">⚙</button>
          <button className="text-white/90 hover:text-white" onClick={async ()=>{ await supabase.auth.signOut(); navigate('/') }}>Log out</button>
        </div>
      </div>
    </div>
  )
}
