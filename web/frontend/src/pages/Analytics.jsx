import { useState } from 'react'
import axios from 'axios'

export default function Analytics() {
  const [stats, setStats] = useState({ total: 0, pending: 0, listed: 0, sold: 0, total_revenue: 0 })
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    setLoaded(true)
    axios.get('/api/analytics/stats').then(r => setStats(r.data)).catch(() => {})
  }

  const cards = [
    { label: 'Produkte', value: stats.total, color: 'text-white' },
    { label: 'Ausstehend', value: stats.pending, color: 'text-yellow-400' },
    { label: 'Inseriert', value: stats.listed, color: 'text-green-400' },
    { label: 'Umsatz', value: `€${stats.total_revenue?.toFixed(2) || '0.00'}`, color: 'text-emerald-400' },
  ]

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4">{'📈'} Analytics</h1>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
