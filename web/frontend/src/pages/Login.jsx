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

  var ref6 = useState('');
  var message = ref6[0];
  var setMessage = ref6[1];

  var ref7 = useState('');
  var resetToken = ref7[0];
  var setResetToken = ref7[1];

  var ref8 = useState('');
  var passwordConfirm = ref8[0];
  var setPasswordConfirm = ref8[1];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'forgot') {
      if (!username) {
        setError('Bitte Username eingeben');
        return;
      }

      setLoading(true);
      var forgotData = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { username: username }
      });
      setLoading(false);

      if (forgotData.success) {
        setMessage(forgotData.message || 'Reset vorbereitet');
        if (forgotData.debug_token) {
          setResetToken(forgotData.debug_token);
          setMode('reset');
          setMessage('Debug-Token erzeugt. Bitte neues Passwort setzen.');
        }
      } else {
        setError(forgotData.detail || forgotData.error || 'Etwas ist schiefgelaufen');
      }
      return;
    }

    if (mode === 'reset') {
      if (!resetToken || !password || !passwordConfirm) {
        setError('Bitte alle Felder ausfuellen');
        return;
      }

      setLoading(true);
      var resetData = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: {
          token: resetToken,
          password: password,
          password_confirm: passwordConfirm
        }
      });
      setLoading(false);

      if (resetData.success) {
        setMessage(resetData.message || 'Passwort zurueckgesetzt');
        setPassword('');
        setPasswordConfirm('');
        setResetToken('');
        setMode('login');
      } else {
        setError(resetData.detail || resetData.error || 'Etwas ist schiefgelaufen');
      }
      return;
    }

    if (!username || !password) {
      setError('Bitte fuell alle Felder aus');
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
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login' ? 'Login'
              : mode === 'register' ? 'Registrierung'
              : mode === 'forgot' ? 'Passwort vergessen'
              : 'Passwort zuruecksetzen'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={function(e) { setUsername(e.target.value); }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Dein Username"
            />
          </div>

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">
                {mode === 'reset' ? 'Neues Passwort' : 'Passwort'}
              </label>
              <input
                type="password"
                value={password}
                onChange={function(e) { setPassword(e.target.value); }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder={mode === 'reset' ? 'Neues Passwort' : 'Dein Passwort'}
              />
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div className="mb-4">
                <label className="block text-sm text-slate-300 mb-1">Reset-Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={function(e) { setResetToken(e.target.value); }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Token einfuellen"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-slate-300 mb-1">Passwort bestaetigen</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={function(e) { setPasswordConfirm(e.target.value); }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Passwort wiederholen"
                />
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 bg-red-900 border border-red-700 text-red-300 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-900 border border-green-700 text-green-300 rounded-lg px-4 py-2 text-sm whitespace-pre-wrap">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? '...' : (
              mode === 'login' ? 'Anmelden' :
              mode === 'register' ? 'Registrieren' :
              mode === 'forgot' ? 'Reset anfordern' :
              'Passwort speichern'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={function() { setMode('forgot'); setError(''); setMessage(''); }}
                className="block w-full text-sm text-blue-400 hover:text-blue-300 transition"
              >
                Passwort vergessen?
              </button>
              <button
                onClick={function() { setMode('register'); setError(''); setMessage(''); }}
                className="block w-full text-sm text-blue-400 hover:text-blue-300 transition"
              >
                Noch kein Account? Registrieren
              </button>
            </>
          )}

          {mode === 'register' && (
            <button
              onClick={function() { setMode('login'); setError(''); setMessage(''); }}
              className="block w-full text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Schon Account? Anmelden
            </button>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              onClick={function() { setMode('login'); setError(''); setMessage(''); }}
              className="block w-full text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Zurueck zum Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
