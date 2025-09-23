import { Component, ReactNode } from 'react'

export default class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props:any){ super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(){ return { hasError: true } }
  componentDidCatch(err:any){ console.error(err) }
  render(){ return this.state.hasError ? <div className="p-4 rounded-xl bg-red-50 border border-red-200">Something went wrong.</div> : this.props.children }
}
