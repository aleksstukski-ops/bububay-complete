import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { createPortal } from "react-dom";
import ErrorBoundary from "./ErrorBoundary";
import { isLoggedIn, apiFetch } from "./auth";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ImportPage from "./pages/Import";
import Accounts from "./pages/Accounts";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import LoginPage from "./pages/Login";

const nav = [
  { to: "/", label: "Home", icon: "\u{1F4CA}", exact: true },
  { to: "/products", label: "Produkte", icon: "\u{1F4E6}" },
  { to: "/messages", label: "Nachrichten", icon: "\u{1F4AC}" },
  { to: "/import", label: "Import", icon: "\u{1F4E5}" },
  { to: "/accounts", label: "Konten", icon: "\u{1F4F1}" },
  { to: "/analytics", label: "Stats", icon: "\u{1F4C8}" },
  { to: "/settings", label: "Mehr", icon: "\u2699\uFE0F" },
];

function RequireAuth({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PageWrapper({ name, children }) {
  return <ErrorBoundary name={name}>{children}</ErrorBoundary>;
}

function DesktopSidebar() {
  return (
    <nav className="hidden md:flex w-56 bg-slate-800 border-r border-slate-700 p-4 flex-col gap-1 shrink-0 h-screen sticky top-0">
      <h1 className="text-xl font-bold text-blue-400 mb-6 px-2">{'\u{1F43B}'} BubuKleinanzeigen</h1>
      {nav.map(function(n) {
        return (
          <NavLink key={n.to} to={n.to} end={n.exact}
            className={({ isActive }) => 'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ' + (isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700')}>
            <span>{n.icon}</span> {n.label}
          </NavLink>
        );
      })}
      <div className="mt-auto pt-4 border-t border-slate-700">
        <button onClick={function() { sessionStorage.clear(); window.location.hash = '#/login'; }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700 w-full">
          <span>{'\u{1F6AA}'}</span> Logout
        </button>
      </div>
    </nav>
  );
}

function MobileBottomNav() {
  var location = useLocation();
  var mainNav = nav.slice(0, 5);
  return createPortal(
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex z-50" style={{paddingBottom: 'env(safe-area-inset-bottom, 0px)'}}>
      {mainNav.map(function(n) {
        var isActive = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
        return (
          <NavLink key={n.to} to={n.to} end={n.exact}
            className={'flex-1 flex flex-col items-center py-2 text-xs transition ' + (isActive ? 'text-blue-400' : 'text-slate-400')}>
            <span className="text-lg mb-0.5">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        );
      })}
    </nav>,
    document.body
  );
}

function MobileHeader() {
  var location = useLocation();
  var current = nav.find(function(n) {
    if (n.exact) return location.pathname === n.to;
    return location.pathname.startsWith(n.to);
  });
  return (
    <header className="md:hidden sticky top-0 bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
      <h1 className="text-lg font-bold text-blue-400">{'\u{1F43B}'} BubuKleinanzeigen</h1>
      <span className="text-sm text-slate-400">{current ? current.icon + ' ' + current.label : ''}</span>
    </header>
  );
}

function AppContent() {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth><PageWrapper name="Dashboard"><Dashboard /></PageWrapper></RequireAuth>} />
            <Route path="/products" element={<RequireAuth><PageWrapper name="Products"><Products /></PageWrapper></RequireAuth>} />
            <Route path="/import" element={<RequireAuth><PageWrapper name="Import"><ImportPage /></PageWrapper></RequireAuth>} />
            <Route path="/accounts" element={<RequireAuth><PageWrapper name="Accounts"><Accounts /></PageWrapper></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><PageWrapper name="Messages"><Messages /></PageWrapper></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><PageWrapper name="Settings"><Settings /></PageWrapper></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><PageWrapper name="Analytics"><Analytics /></PageWrapper></RequireAuth>} />
          </Routes>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
