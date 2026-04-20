import { HashRouter, Routes, Route, NavLink } from "react-router-dom"
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Import from './pages/Import'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Produkte', icon: '📦' },
  { to: '/import', label: 'Import', icon: '📥' },
  { to: '/accounts', label: 'Konten', icon: '📱' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
]

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <nav className="w-56 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-1 shrink-0">
          <h1 className="text-xl font-bold text-blue-400 mb-6 px-2">🐻 BubuBay Kleinanzeigen</h1>
          {nav.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/import" element={<Import />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
