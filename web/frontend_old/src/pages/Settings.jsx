import { useState, useEffect } from 'react'
import axios from 'axios'


export default function Settings() {
  const [form, setForm] = useState({
    default_discount_percent: 10,
    default_price_type: 'fixed',
    default_category: '',
    standard_text: 'Privater Verkauf - keine Garantie, keine Rücknahme. Versand möglich. Abholung jederzeit.',
    keywords: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    axios.get('/api/listing/settings').then(r => {
      if (r.data) setForm({ ...form, ...r.data })
    }).catch(() => {})
  }, [])

  const save = async () => {
    await axios.put('/api/listing/settings', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Standard-Rabatt (%)</label>
          <input type="number" value={form.default_discount_percent} onChange={e => setForm({...form, default_discount_percent: parseFloat(e.target.value)||0})}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Standard-Preistyp</label>
          <select value={form.default_price_type} onChange={e => setForm({...form, default_price_type: e.target.value})}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full">
            <option value="fixed">Festpreis</option>
            <option value="negotiable">Verhandlungsbasis</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Standard-Kategorie</label>
          <input value={form.default_category} onChange={e => setForm({...form, default_category: e.target.value})}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full focus:border-blue-500 outline-none" placeholder="z.B. Elektronik" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Standard-Text (wird an Beschreibung angehängt)</label>
          <textarea value={form.standard_text} onChange={e => setForm({...form, standard_text: e.target.value})} rows={3}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full focus:border-blue-500 outline-none resize-y" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Zusätzliche Keywords (kommagetrennt)</label>
          <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full focus:border-blue-500 outline-none" placeholder="z.B. Neu, OVP, Top Zustand" />
        </div>
        <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium">
          💾 Speichern {saved && '✓'}
        </button>
      </div>
    </div>
  )
}
