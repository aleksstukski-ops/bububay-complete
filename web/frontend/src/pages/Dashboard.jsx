import { useEffect, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import axios from 'axios'

const CACHE_KEY = 'bubuanzeigen_dashboard'
const CACHE_TTL = 5 * 60 * 1000

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [listings, setListings] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [activeAccountId, setActiveAccountId] = useState(null)

  useEffect(function() {
    load()
  }, [])

  async function load(forceRefresh) {
    if (!forceRefresh) {
      try {
        var cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
          var parsed = JSON.parse(cached)
          if (Date.now() - parsed.ts < CACHE_TTL) {
            setStats(parsed.data.stats)
            setListings(parsed.data.listings)
            setActiveAccountId(parsed.data.activeAccountId || null)
            return
          }
        }
      } catch {}
    }

    try {
      var accountsRes = await axios.get('/api/accounts')
      var accounts = accountsRes.data || []
      var activeAccount =
        accounts.find(function(a) { return a.session_active }) ||
        accounts[0] ||
        null

      setActiveAccountId(activeAccount ? activeAccount.id : null)

      if (!activeAccount) {
        var emptyStats = {
          online: 0,
          total: 0,
          followers: 0,
          rating: '',
          account: {},
          accounts: accounts
        }
        setStats(emptyStats)
        setListings([])
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { stats: emptyStats, listings: [], activeAccountId: null },
          ts: Date.now()
        }))
        return
      }

      var klRes = await axios.get('/api/kleinanzeigen/listings/' + activeAccount.id).catch(function() { return null })
      var kl = klRes ? klRes.data : {}

      var newStats = {
        online: (kl && kl.stats && kl.stats.online) || 0,
        total: (kl && kl.stats && kl.stats.total) || 0,
        followers: (kl && kl.stats && kl.stats.followers) || 0,
        rating: (kl && kl.stats && kl.stats.rating) || '',
        account: (kl && kl.account) || {},
        accounts: accounts
      }

      var newListings = (kl && kl.listings) || []
      setStats(newStats)
      setListings(newListings)

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: { stats: newStats, listings: newListings, activeAccountId: activeAccount.id },
        ts: Date.now()
      }))
    } catch (e) {}
  }

  async function openListingDetail(id) {
    if (!activeAccountId) return

    setSelectedId(id)
    var ck = 'bubuanzeigen_detail_' + activeAccountId + '_' + id

    try {
      var cached = sessionStorage.getItem(ck)
      if (cached) {
        var parsed = JSON.parse(cached)
        if (Date.now() - parsed.ts < CACHE_TTL) {
          setDetail(parsed.data)
          setEditForm(parsed.data)
          return
        }
      }
    } catch {}

    setDetailLoading(true)
    setEditMode(false)
    setSaveResult(null)

    try {
      var res = await axios.get('/api/kleinanzeigen/listing/' + activeAccountId + '/' + id)
      if (res.data.success) {
        setDetail(res.data.detail)
        setEditForm(res.data.detail)
        sessionStorage.setItem(ck, JSON.stringify({ data: res.data.detail, ts: Date.now() }))
      } else {
        setDetail(null)
      }
    } catch (e) {
      setDetail(null)
    }

    setDetailLoading(false)
  }

  async function saveListing() {
    if (!activeAccountId) return

    setSaving(true)
    setSaveResult(null)

    try {
      var res = await axios.put('/api/kleinanzeigen/listing/' + activeAccountId + '/' + selectedId, editForm)
      setSaveResult(res.data)
      if (res.data.success) {
        setEditMode(false)
        setDetail(Object.assign({}, detail, editForm))
        sessionStorage.removeItem(CACHE_KEY)
        sessionStorage.removeItem('bubuanzeigen_detail_' + activeAccountId + '_' + selectedId)
      }
    } catch (e) {
      setSaveResult({ success: false, message: 'Fehler beim Speichern' })
    }

    setSaving(false)
  }

  function closePanel() {
    flushSync(function() {
      setSelectedId(null)
      setDetail(null)
      setEditMode(false)
      setSaveResult(null)
    })
  }

  if (!stats) {
    return <div className="flex items-center justify-center py-20 text-slate-400">Lade Daten...</div>
  }

  var sorted = listings.slice().sort(function(a, b) { return (b.visitors || 0) - (a.visitors || 0) })
  var totalVisitors = listings.reduce(function(s, l) { return s + (l.visitors || 0) }, 0)
  var totalSaved = listings.reduce(function(s, l) { return s + (l.saved || 0) }, 0)

  var statCards = [
    { label: 'Online', value: stats.online, icon: '📋', color: 'bg-blue-600' },
    { label: 'Gesamt', value: stats.total, icon: '📊', color: 'bg-slate-700' },
    { label: 'Besucher', value: totalVisitors.toLocaleString(), icon: '👁️', color: 'bg-green-600' },
    { label: 'Gemerkt', value: totalSaved, icon: '❤️', color: 'bg-purple-600' },
    { label: 'Follower', value: stats.followers, icon: '👥', color: 'bg-amber-600' },
    { label: 'Bewertung', value: stats.rating, icon: '⭐', color: 'bg-emerald-600' }
  ]

  var selectedListing = selectedId ? listings.find(function(l) { return l.id === selectedId }) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{'👋'} Hey {stats.account.name || 'Chef'}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{stats.account.email}</p>
        </div>
        <button onClick={function() { load(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
          {'🔄'} Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map(function(s) {
          return (
            <div key={s.label} className={s.color + ' rounded-xl p-3 md:p-4 text-white'}>
              <div className="flex items-center gap-1.5 mb-1 text-xs opacity-80">{s.icon} {s.label}</div>
              <div className="text-xl md:text-2xl font-bold">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="mb-4">
        <h2 className="text-base md:text-lg font-semibold mb-3">{'📋'} Deine Inserate ({listings.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sorted.map(function(l) {
          var isActive = selectedId === l.id
          return (
            <div key={l.id}
              onClick={function() { if (isActive) { closePanel() } else { openListingDetail(l.id) } }}
              className={'bg-slate-800 rounded-xl p-4 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ' + (isActive ? 'ring-2 ring-blue-500' : '')}>
              {l.image && (
                <div className="mb-2 rounded-lg overflow-hidden bg-slate-700 h-32">
                  <img src={'/api/img-proxy?url=' + encodeURIComponent(l.image)} alt={l.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400 shrink-0">{l.category}</span>
                <span className={'text-xs px-1.5 py-0.5 rounded ' + (l.ends && isExpiringSoon(l.ends) ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-400')}>{l.ends || '-'}</span>
              </div>
              <h3 className="font-medium text-sm text-slate-100 mb-2 line-clamp-2">{l.title}</h3>
              <div className="text-lg font-bold text-green-400 mb-3">{l.price}</div>
              <div className="flex gap-4 text-xs text-slate-400">
                <span>{'👁️'} {l.visitors}</span>
                <span>{'❤️'} {l.saved || 0}</span>
              </div>
            </div>
          )
        })}
      </div>

      {createPortal(
        <div
          className="fixed inset-0 z-50 transition-transform duration-200 ease-in-out"
          style={{
            transform: selectedId ? 'translateX(0)' : 'translateX(100%)',
            pointerEvents: selectedId ? 'auto' : 'none'
          }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={closePanel} />

          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 shadow-2xl flex flex-col" style={{ height: '100dvh' }}>
            <div className="flex-shrink-0 p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">{'📋'} Inserat-Details</h2>
              <button onClick={closePanel} className="text-slate-400 hover:text-white text-xl">{'✕'}</button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
              {selectedId && detailLoading && (
                <div className="p-8 text-center text-slate-400">{'⏳'} Lade Details...</div>
              )}

              {selectedId && detail && (
                <div className="p-4 space-y-4">
                  {selectedListing && (
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Kategorie</div>
                      <div className="font-medium">{selectedListing.category}</div>
                      <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                        <div><div className="text-xs text-slate-400">{'👁️'} Besucher</div><div className="font-bold">{selectedListing.visitors}</div></div>
                        <div><div className="text-xs text-slate-400">{'❤️'} Gemerkt</div><div className="font-bold">{selectedListing.saved || 0}</div></div>
                        <div><div className="text-xs text-slate-400">{'📅'} Endet</div><div className="font-bold">{selectedListing.ends}</div></div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Titel</label>
                    {editMode ? (
                      <input value={editForm.title || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { title: e.target.value })) }}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                    ) : (
                      <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm font-medium">{detail.title || '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Preis</label>
                    {editMode ? (
                      <input type="number" value={editForm.price || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { price: e.target.value })) }}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
                    ) : (
                      <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm font-bold text-green-400">{detail.price ? detail.price + ' €' : '-'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Beschreibung</label>
                    {editMode ? (
                      <textarea value={editForm.description || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { description: e.target.value })) }} rows={4}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none resize-y" />
                    ) : (
                      <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">{detail.description || '-'}</div>
                    )}
                  </div>

                  {saveResult && (
                    <div className={'rounded-lg px-3 py-2 text-sm ' + (saveResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300')}>
                      {saveResult.message || (saveResult.success ? 'Gespeichert' : 'Fehler')}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <button onClick={saveListing} disabled={saving}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-2.5 rounded-lg font-medium text-sm">
                          {saving ? 'Speichert...' : 'Speichern'}
                        </button>
                        <button onClick={function() { setEditMode(false); setEditForm(detail) }}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm">
                          Abbrechen
                        </button>
                      </>
                    ) : (
                      <button onClick={function() { setEditMode(true) }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm">
                        Bearbeiten
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function isExpiringSoon(endsText) {
  if (!endsText) return false
  return endsText.toLowerCase().includes('heute') || endsText.toLowerCase().includes('morgen')
}
