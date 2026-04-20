import { useState } from 'react'
import axios from 'axios'

export default function Settings() {
  const [form, setForm] = useState({
    default_discount_percent: 10,
    default_price_type: 'fixed',
    standard_text: 'Privater Verkauf - keine Garantie, keine Rücknahme. Versand möglich. Abholung jederzeit.',
    keywords: '',
    default_condition: 'wie_neu',
    default_shipping_type: 'versand',
    default_shipping_cost: 4.99,
  })
  const [status, setStatus] = useState(null)
  const [statusMsg, setStatusMsg] = useState('')
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    setLoaded(true)
    axios.get('/api/listing/settings').then(r => {
      if (r.data && r.data[0]) setForm(f => ({ ...f, ...r.data[0] }))
    }).catch(() => {})
  }

  async function save() {
    setStatus(null); setStatusMsg('')
    try {
      await axios.put('/api/listing/settings', form)
      setStatus('success'); setStatusMsg('✅ Gespeichert!')
    } catch (e) {
      setStatus('error'); setStatusMsg('❌ ' + (e.response?.data?.detail || e.message))
    }
    setTimeout(() => { setStatus(null); setStatusMsg('') }, 4000)
  }

  const ic = "bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-sm w-full focus:border-blue-500 outline-none"

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4">{'⚙️'} Einstellungen</h1>

      {status && (
        <div className={`mb-3 p-2.5 rounded-lg text-sm font-medium ${status === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
          {statusMsg}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-4 md:p-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Standard-Rabatt %</label>
            <input type="number" value={form.default_discount_percent}
              onChange={e => setForm({...form, default_discount_percent: parseFloat(e.target.value)||0})} className={ic} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Preistyp</label>
            <select value={form.default_price_type} onChange={e => setForm({...form, default_price_type: e.target.value})} className={ic}>
              <option value="fixed">Festpreis</option>
              <option value="negotiable">Verhandlungsbasis</option>
              <option value="give_away">Zu verschenken</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Zustand</label>
            <select value={form.default_condition} onChange={e => setForm({...form, default_condition: e.target.value})} className={ic}>
              <option value="neu">Neu</option>
              <option value="wie_neu">Wie neu</option>
              <option value="gut">Gut</option>
              <option value="akzeptabel">Akzeptabel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Versandart</label>
            <select value={form.default_shipping_type} onChange={e => setForm({...form, default_shipping_type: e.target.value})} className={ic}>
              <option value="versand">Versand</option>
              <option value="abholung">Nur Abholung</option>
              <option value="beides">Versand + Abholung</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Versandkosten €</label>
            <input type="number" step="0.01" value={form.default_shipping_cost}
              onChange={e => setForm({...form, default_shipping_cost: parseFloat(e.target.value)||0})} className={ic} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Standard-Text</label>
          <textarea value={form.standard_text} onChange={e => setForm({...form, standard_text: e.target.value})} rows={3}
            className={ic + " resize-y"} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Keywords (kommagetrennt)</label>
          <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})}
            className={ic} placeholder="Neu, OVP, Top" />
        </div>
        <button onClick={save}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
          {'💾'} Speichern
        </button>
      </div>
    </div>
  )
}
