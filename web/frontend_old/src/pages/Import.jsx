import { useState } from 'react'
import axios from 'axios'

export default function Import() {
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleImport = async () => {
    const list = urls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
    if (!list.length) return
    setLoading(true)
    setResult(null)
    try {
      const r = await axios.post('/api/products/import', { urls: list })
      setResult(r.data)
      setUrls('')
    } catch (e) {
      setResult({ failed: 1, details: [{ url: '', status: 'error' }] })
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Import — Amazon → Kleinanzeigen</h1>
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <label className="block text-sm text-slate-300 mb-2">Amazon Links (einer pro Zeile)</label>
        <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={10}
          placeholder="https://www.amazon.de/dp/B0XXXXXXXX&#10;https://www.amazon.de/dp/B0YYYYYYYY&#10;..."
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm font-mono focus:border-blue-500 outline-none resize-y" />
        <div className="flex items-center gap-3 mt-3">
          <button onClick={handleImport} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium">
            {loading ? '⏳' : '📥'}
            {loading ? 'Importiere...' : 'Importieren'}
          </button>
          <span className="text-sm text-slate-400">{urls.split('\n').filter(u => u.trim()).length} Links erkannt</span>
        </div>
      </div>

      {result && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Ergebnis</h2>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-green-400">✅ {result.imported} importiert</div>
            <div className="flex items-center gap-2 text-yellow-400">⚠️ {result.skipped} Duplikate</div>
            {result.failed > 0 && <div className="flex items-center gap-2 text-red-400">⚠️ {result.failed} fehlgeschlagen</div>}
          </div>
          {result.details?.length > 0 && (
            <div className="space-y-1 max-h-96 overflow-auto">
              {result.details.map((d, i) => (
                <div key={i} className={`text-xs p-2 rounded ${d.status === 'imported' ? 'bg-green-900/30 text-green-300' : d.status === 'skipped' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-red-900/30 text-red-300'}`}>
                  <span className="font-medium">{d.status}</span>
                  {d.title && <span className="ml-2">{d.title}</span>}
                  {d.url && !d.title && <span className="ml-2 truncate inline-block max-w-md">{d.url}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
