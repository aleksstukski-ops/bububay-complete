import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = () => {
    const params = {}
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    axios.get('/api/products', { params }).then(r => setProducts(r.data)).catch(() => {})
  }

  useEffect(load, [search, statusFilter])

  const deleteProduct = async (id) => {
    await axios.delete(`/api/products/${id}`)
    load()
  }

  const startEdit = (p) => {
    setEditing(p.id)
    setEditForm({ price_set: p.price_set, price_type: p.price_type, status: p.status, category: p.category })
  }

  const saveEdit = async (id) => {
    await axios.put(`/api/products/${id}`, editForm)
    setEditing(null)
    load()
  }

  const bulkStatus = async (status) => {
    await axios.post('/api/products/bulk-status', { ids: [...selected], status })
    setSelected(new Set())
    load()
  }

  const toggle = (id) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const statusBadge = (s) => {
    const c = { pending: 'bg-yellow-600', listed: 'bg-blue-600', sold: 'bg-green-600' }
    return <span className={`text-xs px-2 py-0.5 rounded-full ${c[s] || 'bg-slate-600'}`}>{s}</span>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produkte ({products.length})</h1>
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          🔍
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen..."
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-blue-500 outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm">
          <option value="">Alle Status</option>
          <option value="pending">Pending</option>
          <option value="listed">Inseriert</option>
          <option value="sold">Verkauft</option>
        </select>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button onClick={() => bulkStatus('listed')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">→ Inseriert</button>
            <button onClick={() => bulkStatus('sold')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm">→ Verkauft</button>
            <span className="text-slate-400 text-sm py-2">{selected.size} ausgewählt</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="bg-slate-800 rounded-lg p-4 flex items-start gap-4">
            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="mt-1" />
            {p.images?.[0] && <img src={p.images[0]} className="w-12 h-12 rounded object-cover" alt="" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-sm text-slate-400">{p.brand} · €{p.price_original}</div>
              {editing === p.id ? (
                <div className="flex gap-2 mt-2 items-center">
                  <input type="number" step="0.01" value={editForm.price_set} onChange={e => setEditForm({...editForm, price_set: parseFloat(e.target.value)||0})}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-24" placeholder="Preis" />
                  <select value={editForm.price_type} onChange={e => setEditForm({...editForm, price_type: e.target.value})}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm">
                    <option value="fixed">Festpreis</option>
                    <option value="negotiable">Verhandlungsbasis</option>
                  </select>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm">
                    <option value="pending">Pending</option>
                    <option value="listed">Inseriert</option>
                    <option value="sold">Verkauft</option>
                  </select>
                  <button onClick={() => saveEdit(p.id)} className="text-green-400 hover:text-green-300">✅</button>
                  <button onClick={() => setEditing(null)} className="text-red-400 hover:text-red-300">❌</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">€{p.price_set}</span>
                  {statusBadge(p.status)}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)} className="text-slate-400 hover:text-white">✏️</button>
              <button onClick={() => deleteProduct(p.id)} className="text-slate-400 hover:text-red-400">🗑️</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-slate-500 text-center py-8">Keine Produkte gefunden</p>}
      </div>
    </div>
  )
}
