import { useState, useEffect } from 'react'
import axios from 'axios'


export default function Analytics() {
  const [stats, setStats] = useState({ total: 0, pending: 0, listed: 0, sold: 0, total_revenue: 0 })
  const [revenue, setRevenue] = useState([])

  useEffect(() => {
    axios.get('/api/analytics/stats').then(r => setStats(r.data)).catch(() => {})
    axios.get('/api/analytics/revenue').then(r => setRevenue(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">📊 Gesamtstatistik</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Gesamtprodukte</span><span className="font-bold">{stats.total}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Ausstehend</span><span className="font-bold text-yellow-400">{stats.pending}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Inseriert</span><span className="font-bold text-blue-400">{stats.listed}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Verkauft</span><span className="font-bold text-green-400">{stats.sold}</span></div>
            <hr className="border-slate-700" />
            <div className="flex justify-between"><span className="text-slate-400">Gesamtumsatz</span><span className="font-bold text-xl text-emerald-400">€{stats.total_revenue.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">📈 Umsatz pro Konto</h2>
          {revenue.length === 0 ? (
            <p className="text-slate-500 text-sm">Noch keine Verkäufe</p>
          ) : (
            <div className="space-y-3">
              {revenue.map((r, i) => {
                const max = Math.max(...revenue.map(x => x.revenue || 0))
                const pct = max > 0 ? ((r.revenue || 0) / max * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{r.account}</span>
                      <span className="font-medium">€{(r.revenue || 0).toFixed(2)} ({r.sold})</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
