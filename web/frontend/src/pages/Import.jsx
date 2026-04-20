import { useState } from 'react'
import axios from 'axios'

export default function Import() {
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('')

  async function handleImport() {
    const list = urls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
    if (!list.length) { setStatus('❌ Keine gültigen Links'); return }
    setLoading(true); setResult(null); setStatus('')
    try {
      const r = await axios.post('/api/products/import', { urls: list })
      setResult(r.data); setUrls('')
      setStatus(`✅ ${r.data.imported} importiert, ${r.data.skipped} Duplikate`)
      setTimeout(() => setStatus(''), 4000)
    } catch (e) {
      setStatus('❌ Import fehlgeschlagen')
      setResult({ failed: 1, details: [{ url: '', status: 'error' }] })
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4">{'📥'} Import</h1>

      {status && (
        <div className={`mb-3 p-2.5 rounded-lg text-sm ${status.includes('❌') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
          {status}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <label className="block text-sm text-slate-300 mb-2">Amazon Links (einer pro Zeile)</label>
        <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={6}
          placeholder={"https://www.amazon.de/dp/B0XXXXXXXX\nhttps://www.amazon.de/dp/B0YYYYYYYY"}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm font-mono focus:border-blue-500 outline-none resize-y" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">{urls.split('\n').filter(u => u.trim()).length} Links</span>
          <button onClick={handleImport} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            {loading ? '⏳ Importiere...' : '📥 Importieren'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="text-green-400 text-sm">{'✅'} {result.imported} importiert</span>
            {result.skipped > 0 && <span className="text-yellow-400 text-sm">{'⚠️'} {result.skipped} Duplikate</span>}
            {result.failed > 0 && <span className="text-red-400 text-sm">{'❌'} {result.failed} fehlgeschlagen</span>}
          </div>
          {result.details?.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-auto">
              {result.details.map((d, i) => (
                <div key={i} className={`text-xs p-2 rounded ${d.status === 'imported' ? 'bg-green-900/30 text-green-300' : d.status === 'skipped' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-red-900/30 text-red-300'}`}>
                  <span className="font-medium">{d.status}</span>
                  {d.title && <span className="ml-2">{d.title}</span>}
                  {d.url && !d.title && <span className="ml-2 truncate inline-block max-w-[200px]">{d.url}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
