import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, listed: 0, sold: 0, total_revenue: 0 })
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    axios.get('/api/analytics/stats').then(r => setStats(r.data)).catch(() => {})
    axios.get('/api/accounts').then(r => setAccounts(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Produkte', value: stats.total, icon: Package, color: 'bg-blue-600' },
    { label: 'Ausstehend', value: stats.pending, icon: Clock, color: 'bg-yellow-600' },
    { label: 'Inseriert', value: stats.listed, icon: CheckCircle, color: 'bg-green-600' },
    { label: 'Verkauft', value: stats.sold, icon: AlertCircle, color: 'bg-purple-600' },
    { label: 'Umsatz', value: `€${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`${color} rounded-xl p-4 text-white`}>
            <div className="flex items-center gap-2 mb-1 text-sm opacity-80"><Icon size={16} /> {label}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">📱 Konten</h2>
        {accounts.length === 0 ? <p className="text-slate-400 text-sm">Keine Konten angelegt</p> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {accounts.map(a => (
              <div key={a.id} className="bg-slate-700 rounded-lg p-3">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-slate-400">Handy #{a.phone_id} · {a.platform}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${a.is_active ? 'bg-green-600' : 'bg-slate-600'}`}>
                  {a.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
