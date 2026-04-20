var TOKEN_KEY = 'bubuanzeigen_token';

function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch(e) { return null; }
}

function setToken(t) {
  try { sessionStorage.setItem(TOKEN_KEY, t); } catch(e) {}
}

function clearToken() {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch(e) {}
}

export function isLoggedIn() {
  return !!getToken();
}

export function getTokenValue() {
  return getToken();
}

export async function apiFetch(url, options) {
  var token = getToken();
  var headers = Object.assign({}, (options && options.headers) || {});
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  if (options && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  var resp = await fetch(url, Object.assign({}, options || {}, { headers: headers }));
  if (resp.status === 401) {
    clearToken();
    window.location.hash = '#/login';
    return { success: false, error: 'Nicht eingeloggt' };
  }
  return resp.json();
}
