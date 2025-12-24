import React, { useEffect, useState } from 'react'
import partnerService from '../services/partnerService'

export default function PartnersDashboard() {
  const [partners, setPartners] = useState([])
  const [draft, setDraft] = useState({})

  const load = () => setPartners(partnerService.getAllPartners())

  useEffect(() => { load() }, [])

  const save = () => {
    if (!draft.name) return alert('Partner name required')
    partnerService.savePartner({ ...draft })
    setDraft({})
    load()
  }

  const remove = (id) => {
    if (!confirm('Delete partner?')) return
    partnerService.deletePartner(id)
    load()
  }

  return (
    <div className="pt-24 px-6">
      <h2 className="text-2xl font-bold text-white mb-4">Partners</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Add / Edit Partner</h4>
          <input placeholder="Name" className="w-full mb-2 p-2 bg-slate-900" value={draft.name||''} onChange={(e)=>setDraft({...draft,name:e.target.value})} />
          <select className="w-full mb-2 p-2 bg-slate-900" value={draft.type||'channel'} onChange={(e)=>setDraft({...draft,type:e.target.value})}>
            <option value="channel">Channel Partner</option>
            <option value="developer">Developer</option>
          </select>
          <input placeholder="Default commission %" className="w-full mb-2 p-2 bg-slate-900" value={draft.defaultCommission||''} onChange={(e)=>setDraft({...draft,defaultCommission: Number(e.target.value)})} />
          <input placeholder="Capacity" className="w-full mb-2 p-2 bg-slate-900" value={draft.capacity||''} onChange={(e)=>setDraft({...draft,capacity: Number(e.target.value)})} />
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 bg-cyan-600 rounded text-white">Save</button>
            <button onClick={()=>setDraft({})} className="px-4 py-2 bg-slate-700 rounded text-gray-200">Reset</button>
          </div>
        </div>

        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Existing Partners</h4>
          <div className="space-y-2 max-h-96 overflow-auto text-sm text-gray-300">
            {partners.length === 0 ? <p className="text-gray-500">No partners yet</p> : partners.map(p => (
              <div key={p.id} className="p-3 bg-slate-900 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs">Type: {p.type} — Commission: {p.defaultCommission||0}% — Capacity: {p.capacity||'N/A'}</p>
                  <p className="text-xs">Revenue entries: {(p.revenue||[]).length}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setDraft(p)} className="px-3 py-1 bg-emerald-600 rounded text-white text-sm">Edit</button>
                  <button onClick={() => remove(p.id)} className="px-3 py-1 bg-red-600 rounded text-white text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
