import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, SectionTitle } from '../components/UI'

export default function ParkMap(){
  const [mapUrl, setMapUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{
    const { data } = supabase.storage.from('park-assets').getPublicUrl('map.png')
    setMapUrl(data.publicUrl)
  }, [])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await supabase.storage.from('park-assets').upload('map.png', file, { upsert: true })
    const { data } = supabase.storage.from('park-assets').getPublicUrl('map.png')
    setMapUrl(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <SectionTitle>Theme Park Map</SectionTitle>
        <p className="text-sm text-slate-600 mb-2">Upload a map image (admins recommended). It will be visible to everyone.</p>
        <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
      </Card>
      {mapUrl ? (
        <img src={mapUrl} alt="Park Map" className="w-full rounded-2xl shadow border" />
      ) : (
        <Card className="p-8 text-center">No map uploaded yet.</Card>
      )}
    </div>
  )
}
