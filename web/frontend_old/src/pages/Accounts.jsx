import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({ name: '', phone_id: 1, platform: 'kleinanzeigen' })

  const load = () => axios.get('/api/accounts').then(r => setAccounts(r.data)).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.name) return
    await axios.post('/api/accounts', form)
    setForm({ name: '', phone_id: Math.min(4, (form.phone_id % 4) + 1), platform: 'kleinanzeigen' })
    load()
  }

  const remove = async (id) => {
    await axios.delete(`/api/accounts/${id}`)
    load()
  }

  const toggleActive = async (acc) => {
    await axios.put(`/api/accounts/${acc.id}`, { is_active: !acc.is_active })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Konten</h1>
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Handy 1" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Handy ID</label>
            <select value={form.phone_id} onChange={e => setForm({...form, phone_id: parseInt(e.target.value)})}
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm">
              {[1,2,3,4].map(i => <option key={i} value={i}>#{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Plattform</label>
            <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm">
              <option value="kleinanzeigen">Kleinanzeigen</option>
              <option value="ebay">eBay</option>
            </select>
          </div>
          <button onClick={create} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            ➕ Hinzufügen
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(a => (
          <div key={a.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-700 rounded-lg p-2">📱</div>
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-slate-400">Handy #{a.phone_id} · {a.platform} · {a.is_active ? '🟢' : '🔴'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleActive(a)} className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg">
                {a.is_active ? 'Deaktivieren' : 'Aktivieren'}
              </button>
              <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-300">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
