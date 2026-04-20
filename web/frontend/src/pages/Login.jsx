import { useState } from 'react';
import { apiFetch, setToken } from '../auth';

export default function LoginPage() {
  var ref = useState('login');
  var mode = ref[0];
  var setMode = ref[1];
  var ref2 = useState('');
  var username = ref2[0];
  var setUsername = ref2[1];
  var ref3 = useState('');
  var password = ref3[0];
  var setPassword = ref3[1];
  var ref4 = useState('');
  var error = ref4[0];
  var setError = ref4[1];
  var ref5 = useState(false);
  var loading = ref5[0];
  var setLoading = ref5[1];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Bitte füll alle Felder aus');
      return;
    }
    setLoading(true);
    var endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    var data = await apiFetch(endpoint, {
      method: 'POST',
      body: { username: username, password: password }
    });
    setLoading(false);
    if (data.success && data.token) {
      setToken(data.token);
      window.location.hash = '#/';
    } else {
      setError(data.detail || data.error || 'Etwas ist schiefgelaufen');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{'🐻'}</div>
          <h1 className="text-2xl font-bold text-blue-400">BubuKleinanzeigen</h1>
          <p className="text-sm text-slate-400 mt-1">Bald online. Jetzt noch nicht.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Username</label>
            <input type="text" value={username}
              onChange={function(e) { setUsername(e.target.value); }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Dein Username" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Passwort</label>
            <input type="password" value={password}
              onChange={function(e) { setPassword(e.target.value); }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Dein Passwort" />
          </div>

          {error && (
            <div className="mb-4 bg-red-900 border border-red-700 text-red-300 rounded-lg px-4 py-2 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition">
            {loading ? '...' : (mode === 'login' ? 'Anmelden' : 'Registrieren')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={function() { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm text-blue-400 hover:text-blue-300 transition">
            {mode === 'login' ? 'Noch kein Account? Registrieren' : 'Schon Account? Anmelden'}
          </button>
        </div>
      </div>
    </div>
  );
}
