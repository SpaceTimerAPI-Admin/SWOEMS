import { ReactNode } from 'react'

export const Button = (props: JSX.IntrinsicElements['button']) => (
  <button {...props} className={(props.className ?? '') + ' rounded-xl px-4 py-2 font-medium shadow hover:shadow-md active:scale-[.99] transition bg-sea-600 text-white disabled:opacity-50'} />
)

export const Card = (props: { className?: string; children: ReactNode }) => (
  <div className={(props.className ?? '') + ' rounded-2xl bg-white/90 backdrop-blur border border-white/50 shadow'}>{props.children}</div>
)

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-lg font-semibold text-sea-900 mb-3">{children}</h2>
)

export function Bubble({ icon, title, subtitle, onClick }: { icon: string; title: string; subtitle?: string; onClick?: () => void }){
  return (
    <button onClick={onClick} className="bubble">
      <div className="p-3 rounded-full bg-sea-600 text-white shadow">{icon}</div>
      <div className="text-left">
        <div className="text-lg font-semibold text-sea-900">{title}</div>
        {subtitle && <div className="text-sm text-sea-800/70">{subtitle}</div>}
      </div>
    </button>
  )
}
