import { useState } from 'react'
import axios from 'axios'

const CONDITIONS = [
  { value: 'neu', label: 'Neu' },
  { value: 'wie_neu', label: 'Wie neu' },
  { value: 'gut', label: 'Gut' },
  { value: 'akzeptabel', label: 'Akzeptabel' },
  { value: 'defekt', label: 'Defekt' },
]
const SHIPPING = [
  { value: 'versand', label: 'Versand' },
  { value: 'abholung', label: 'Abholung' },
  { value: 'beides', label: 'Beides' },
]
const PRICE_TYPES = [
  { value: 'fixed', label: 'Festpreis' },
  { value: 'negotiable', label: 'VB' },
  { value: 'give_away', label: 'Zu verschenken' },
]

export default function Products() {
  const [products, setProducts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState(0)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!loaded) {
    setLoaded(true)
    axios.get('/api/products').then(r => setProducts(r.data || [])).catch(() => {})
    axios.get('/api/accounts').then(r => setAccounts(r.data || [])).catch(() => {})
  }

  function reload() { axios.get('/api/products').then(r => setProducts(r.data || [])).catch(() => {}) }

  async function saveProduct(product) {
    try {
      if (product.id) await axios.put(`/api/products/${product.id}`, product)
      else await axios.post('/api/products', product)
      setEditing(null); setShowForm(false); reload()
    } catch (e) { alert('Fehler: ' + (e.response?.data?.detail || e.message)) }
  }

  async function deleteProduct(id) {
    if (!confirm('Löschen?')) return
    await axios.delete(`/api/products/${id}`); reload()
  }

  const filtered = products.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (accountFilter && p.account_id !== accountFilter) return false
    return true
  })

  const statusColors = { pending: 'bg-yellow-600', ready: 'bg-blue-600', listed: 'bg-green-600', sold: 'bg-purple-600' }
  const statusLabels = { pending: 'Ausstehend', ready: 'Bereit', listed: 'Inseriert', sold: 'Verkauft' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">{'📦'} Produkte ({filtered.length})</h1>
        <button onClick={() => { setEditing({}); setShowForm(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium">
          {'➕'} Neu
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 overflow-x-auto">
          {[{v:'all',l:'Alle'},{v:'pending',l:'Ausst.'},{v:'ready',l:'Bereit'},{v:'listed',l:'Drin'},{v:'sold',l:'Verk.'}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-2.5 py-1 rounded text-xs md:text-sm whitespace-nowrap ${filter === f.v ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
              {f.l}
            </button>
          ))}
        </div>
        <select value={accountFilter} onChange={e => setAccountFilter(parseInt(e.target.value))}
          className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs md:text-sm text-slate-300">
          <option value={0}>Alle Konten</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="space-y-2 md:space-y-3">
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Keine Produkte</p>
        ) : filtered.map(p => {
          const acc = accounts.find(a => a.id === p.account_id)
          return (
            <div key={p.id} className="bg-slate-800 rounded-xl p-3 md:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${statusColors[p.status] || 'bg-slate-600'}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                    {acc && <span className="text-xs text-slate-500">{'📱'}{acc.name}</span>}
                  </div>
                  <h3 className="font-semibold text-sm md:text-base truncate">{p.title || 'Ohne Titel'}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs md:text-sm">
                    <span className="text-blue-400 font-bold">
                      {p.price_type === 'give_away' ? 'Gratis' : p.price_type === 'negotiable' ? 'VB' : `€${p.price_set?.toFixed(2) || '0'}`}
                    </span>
                    {p.price_original > 0 && <span className="text-slate-500 line-through text-xs">€{p.price_original.toFixed(2)}</span>}
                    {p.category && <span className="text-slate-500 hidden sm:inline">{'📁'} {p.category}</span>}
                    {p.shipping_type && <span className="text-slate-500">{'🚚'}</span>}
                    {p.location_city && <span className="text-slate-500 hidden sm:inline">{'📍'} {p.location_city}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => { setEditing({...p}); setShowForm(true) }}
                    className="bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg text-sm">{'✏️'}</button>
                  <button onClick={() => deleteProduct(p.id)}
                    className="bg-slate-700 hover:bg-slate-600 text-red-400 px-2.5 py-1.5 rounded-lg text-sm">{'🗑️'}</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && editing !== null && (
        <ProductForm product={editing} accounts={accounts} onSave={saveProduct}
          onClose={() => { setShowForm(false); setEditing(null) }} />
      )}
    </div>
  )
}

function ProductForm({ product, accounts, onSave, onClose }) {
  const [form, setForm] = useState({
    title: product.title || '', brand: product.brand || '', description: product.description || '',
    amazon_url: product.amazon_url || '', price_original: product.price_original || 0,
    price_set: product.price_set || 0, price_type: product.price_type || 'fixed',
    discount_percent: product.discount_percent || 0, category: product.category || '',
    condition: product.condition || 'wie_neu', shipping_type: product.shipping_type || 'versand',
    shipping_cost: product.shipping_cost || 4.99, location_city: product.location_city || '',
    location_plz: product.location_plz || '', account_id: product.account_id || '',
    status: product.status || 'pending',
  })

  const ic = "bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm w-full focus:border-blue-500 outline-none"

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{product.id ? '✏️ Bearbeiten' : '➕ Neues Produkt'}</h2>
          <button onClick={onClose} className="text-slate-400 text-xl">{'✕'}</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Titel *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className={ic} placeholder="iPhone 15 Pro 256GB" maxLength={50} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Marke</label>
              <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                className={ic} placeholder="Apple" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kategorie</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className={ic} placeholder="Handys" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Originalpreis €</label>
              <input type="number" step="0.01" value={form.price_original}
                onChange={e => setForm({...form, price_original: parseFloat(e.target.value)||0})} className={ic} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Verkaufspreis €</label>
              <input type="number" step="0.01" value={form.price_set}
                onChange={e => setForm({...form, price_set: parseFloat(e.target.value)||0})} className={ic} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Preistyp</label>
              <select value={form.price_type} onChange={e => setForm({...form, price_type: e.target.value})} className={ic}>
                {PRICE_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Zustand</label>
              <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className={ic}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Versandart</label>
              <select value={form.shipping_type} onChange={e => setForm({...form, shipping_type: e.target.value})} className={ic}>
                {SHIPPING.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Versandkosten €</label>
              <input type="number" step="0.01" value={form.shipping_cost}
                onChange={e => setForm({...form, shipping_cost: parseFloat(e.target.value)||0})} className={ic} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rabatt %</label>
              <input type="number" value={form.discount_percent}
                onChange={e => setForm({...form, discount_percent: parseFloat(e.target.value)||0})} className={ic} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Stadt</label>
              <input value={form.location_city} onChange={e => setForm({...form, location_city: e.target.value})}
                className={ic} placeholder="Berlin" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">PLZ</label>
              <input value={form.location_plz} onChange={e => setForm({...form, location_plz: e.target.value})}
                className={ic} placeholder="12345" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Beschreibung</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4}
              className={ic + " resize-y"} placeholder="Produktbeschreibung..." />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Amazon Link</label>
            <input value={form.amazon_url} onChange={e => setForm({...form, amazon_url: e.target.value})}
              className={ic} placeholder="https://amazon.de/dp/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Konto</label>
              <select value={form.account_id} onChange={e => setForm({...form, account_id: parseInt(e.target.value)||null})} className={ic}>
                <option value="">Keins</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={ic}>
                <option value="pending">Ausstehend</option>
                <option value="ready">Bereit</option>
                <option value="listed">Inseriert</option>
                <option value="sold">Verkauft</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => onSave({...form, id: product.id})}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
            {'💾'} Speichern
          </button>
          <button onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg">
            Abbruch
          </button>
        </div>
      </div>
    </div>
  )
}
