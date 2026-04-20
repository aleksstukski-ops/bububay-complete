import { useState } from 'react'
import axios from 'axios'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [form, setForm] = useState({
    name: '', phone_id: 1, platform: 'kleinanzeigen',
    email: '', password: '', location_city: '', location_plz: ''
  })
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loginTarget, setLoginTarget] = useState(null)
  const [listings, setListings] = useState(null)
  const [listingsFor, setListingsFor] = useState(null)

  if (!loaded) {
    setLoaded(true)
    loadAccounts()
  }

  function loadAccounts() {
    axios.get('/api/accounts').then(r => setAccounts(r.data)).catch(() => {})
  }

  async function createAccount() {
    if (!form.name) { setStatus('❌ Name erforderlich!'); return }
    try {
      await axios.post('/api/accounts', form)
      setForm({ name: '', phone_id: 1, platform: 'kleinanzeigen', email: '', password: '', location_city: '', location_plz: '' })
      setStatus('✅ Konto erstellt!')
      loadAccounts(); setShowForm(false)
      setTimeout(() => setStatus(''), 3000)
    } catch (e) { setStatus('❌ ' + (e.response?.data?.detail || e.message)) }
  }

  async function startLogin(id) {
    try {
      setStatus('⏳ Öffne Browser für Login...')
      const r = await axios.post(`/api/kleinanzeigen/login/start/${id}`)
      setLoginTarget(id)
      setStatus(r.data.message)
    } catch (e) { setStatus('❌ ' + (e.response?.data?.detail || e.message)) }
  }

  async function completeLogin(id) {
    try {
      const r = await axios.post(`/api/kleinanzeigen/login/complete/${id}`)
      if (r.data.success) {
        setStatus('✅ ' + r.data.message)
        loadAccounts()
      } else {
        setStatus('❌ ' + r.data.message)
      }
      setLoginTarget(null)
      setTimeout(() => setStatus(''), 4000)
    } catch (e) { setStatus('❌ ' + (e.response?.data?.detail || e.message)) }
  }

  async function checkSession(id) {
    try {
      const r = await axios.get(`/api/kleinanzeigen/session/check/${id}`)
      setStatus(r.data.valid ? '✅ Session gültig!' : '❌ Session abgelaufen — neu einloggen')
      loadAccounts()
      setTimeout(() => setStatus(''), 4000)
    } catch (e) { setStatus('❌ ' + (e.response?.data?.detail || e.message)) }
  }

  async function fetchListings(id) {
    try {
      setStatus('⏳ Lade Inserate...')
      const r = await axios.get(`/api/kleinanzeigen/listings/${id}`)
      setListings(r.data.listings || [])
      setListingsFor(id)
      setStatus('')
    } catch (e) { setStatus('❌ ' + (e.response?.data?.detail || e.message)) }
  }

  async function removeAccount(id) {
    if (!confirm('Löschen?')) return
    await axios.delete(`/api/accounts/${id}`); loadAccounts()
  }

  const ic = "bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm w-full focus:border-blue-500 outline-none"

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">{'📱'} Konten ({accounts.length})</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium">
          {'➕'} Neu
        </button>
      </div>

      {status && (
        <div className={`mb-3 p-2.5 rounded-lg text-sm ${status.includes('❌') ? 'bg-red-900/50 text-red-300' : status.includes('⏳') ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>
          {status}
        </div>
      )}

      {/* Login-Modal */}
      {loginTarget !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-5 max-w-md w-full">
            <h2 className="text-lg font-bold mb-3">{'🔑'} Manueller Login</h2>
            <p className="text-sm text-slate-300 mb-4">
              Ein Browser-Fenster wurde auf deinem Mac geöffnet. Logge dich dort manuell in dein Kleinanzeigen-Konto ein.
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Sobald du eingeloggt bist, klicke auf <strong>"Session speichern"</strong> unten.
            </p>
            <div className="flex gap-3">
              <button onClick={() => completeLogin(loginTarget)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium">
                {'✅'} Session speichern
              </button>
              <button onClick={() => { setLoginTarget(null); setStatus('') }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg">
                Abbruch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neues Konto Formular */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Neues Konto</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl">{'✕'}</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Konto-Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={ic} placeholder="Handy 1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Plattform</label>
                  <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className={ic}>
                    <option value="kleinanzeigen">Kleinanzeigen.de</option>
                    <option value="ebay">eBay</option>
                    <option value="shpock">Shpock</option>
                    <option value="vinted">Vinted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Handy ID</label>
                  <select value={form.phone_id} onChange={e => setForm({...form, phone_id: parseInt(e.target.value)})} className={ic}>
                    {[1,2,3,4,5].map(i => <option key={i} value={i}>#{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">E-Mail (nur zur Info)</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className={ic} placeholder="email@beispiel.de" />
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
              <button onClick={createAccount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                {'➕'} Konto erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inserate-Panel */}
      {listings !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50" onClick={() => { setListings(null); setListingsFor(null) }}>
          <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl p-4 md:p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{'📋'} Inserate ({listings.length})</h2>
              <button onClick={() => { setListings(null); setListingsFor(null) }} className="text-slate-400 text-xl">{'✕'}</button>
            </div>
            {listings.length === 0 ? (
              <p className="text-slate-400 text-sm">Keine Inserate gefunden.</p>
            ) : (
              <div className="space-y-2">
                {listings.map((l, i) => (
                  <div key={i} className="bg-slate-700 rounded-lg p-3">
                    <div className="font-medium text-sm">{l.title}</div>
                    <div className="flex gap-3 mt-1 text-xs text-slate-400">
                      {l.price && <span>{l.price}</span>}
                      {l.status && <span>{l.status}</span>}
                      {l.views && <span>{l.views} Aufrufe</span>}
                    </div>
                    {l.url && <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 mt-1 block truncate">{l.url}</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Konto-Liste */}
      <div className="space-y-2 md:space-y-3">
        {accounts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Keine Konten vorhanden</p>
        ) : accounts.map(a => (
          <div key={a.id} className="bg-slate-800 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-slate-700 rounded-lg p-2.5 text-xl shrink-0">{'📱'}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm md:text-base">{a.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {a.platform} · Handy #{a.phone_id}
                    {a.email ? ` · ${a.email}` : ''}
                    {a.location_city ? ` · ${a.location_city}` : ''}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${a.session_active ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'}`}>
                {a.session_active ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Aktions-Buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {!a.session_active ? (
                <button onClick={() => startLogin(a.id)}
                  className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg">
                  {'🔑'} Einloggen
                </button>
              ) : (
                <>
                  <button onClick={() => checkSession(a.id)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg">
                    {'🔄'} Check
                  </button>
                  <button onClick={() => fetchListings(a.id)}
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg">
                    {'📋'} Inserate
                  </button>
                  <button onClick={() => { startLogin(a.id) }}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg">
                    {'🔑'} Re-Login
                  </button>
                </>
              )}
              <button onClick={() => removeAccount(a.id)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-red-400 px-3 py-1.5 rounded-lg ml-auto">
                {'🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
