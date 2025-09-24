import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Ticket {
  id: string
  title: string
  description: string
  priority: string
  location: string
  category: string
  datetime: string
  status: string
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Low')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')

  const navigate = useNavigate()

  async function loadTickets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error loading tickets:', error.message)
    else setTickets(data || [])

    setLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [])

  async function handleCreate() {
    setCreating(true)

    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          title,
          priority,
          location,
          category,
          description,
          datetime: new Date().toISOString(),
          status: 'Open',
        },
      ])
      .select()
      .single()

    if (error) {
      alert('Error creating ticket: ' + error.message)
      console.error(error)
      setCreating(false)
      return
    }

    if (data) {
      setShowForm(false)
      setCreating(false)
      await loadTickets()
      navigate(`/app/tickets/${data.id}`)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Tickets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          New Ticket
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-gray-100 rounded mb-4 shadow">
          <h2 className="text-lg font-bold mb-3">New Ticket</h2>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border p-2 rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded"
            >
              <option>General</option>
              <option>Ride</option>
              <option>Food</option>
              <option>Technical</option>
            </select>
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full mt-3"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : tickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li
              key={t.id}
              className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/app/tickets/${t.id}`)}
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{t.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(t.datetime).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{t.description}</p>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-1 rounded bg-gray-200 text-xs">
                  {t.priority}
                </span>
                <span className="px-2 py-1 rounded bg-gray-200 text-xs">
                  {t.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
