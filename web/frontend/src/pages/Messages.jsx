import { useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import axios from 'axios'

export default function Messages() {
  const [accounts, setAccounts] = useState([])
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [activeAccount, setActiveAccount] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState('')
  const [status, setStatus] = useState('')

  if (!loaded) {
    setLoaded(true)
    axios.get('/api/accounts').then(function(r) {
      var accs = r.data.filter(function(a) { return a.session_active })
      setAccounts(accs)
      if (accs.length > 0) loadConversations(accs[0].id)
    }).catch(function() {})
  }

  async function loadConversations(accountId) {
    setActiveAccount(accountId)
    setActiveConvId(null)
    setMessages([])
    setLoading('Lade Nachrichten...')
    try {
      var r = await axios.get('/api/kleinanzeigen/messages/' + accountId)
      setConversations(r.data.conversations || [])
    } catch (e) {
      setStatus('Fehler: ' + (e.response && e.response.data && e.response.data.detail ? e.response.data.detail : e.message))
    }
    setLoading('')
  }

  async function openConversation(id) {
    setActiveConvId(id)
    setLoading('Lade Chat...')
    try {
      var r = await axios.get('/api/kleinanzeigen/messages/' + activeAccount + '/' + id)
      setMessages(r.data.messages || [])
    } catch (e) {
      setStatus('Fehler: ' + (e.response && e.response.data && e.response.data.detail ? e.response.data.detail : e.message))
    }
    setLoading('')
  }

  async function sendReply() {
    if (!replyText.trim() || activeConvId === null) return
    var text = replyText.trim()
    setReplyText('')
    try {
      var r = await axios.post('/api/kleinanzeigen/messages/' + activeAccount + '/' + activeConvId, { message: text })
      if (r.data.success) {
        setMessages(function(prev) { return prev.concat([{ text: text }]) })
        setTimeout(function() { openConversation(activeConvId) }, 3000)
      } else {
        setStatus('Fehler: ' + r.data.error)
      }
    } catch (e) {
      setStatus('Fehler: ' + (e.response && e.response.data && e.response.data.detail ? e.response.data.detail : e.message))
    }
  }

  async function refresh() {
    if (activeAccount) loadConversations(activeAccount)
  }

  var ic = "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm w-full focus:border-blue-500 outline-none text-white"
  var activeConv = activeConvId ? conversations.find(function(c) { return c.id === activeConvId }) : null

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h1 className="text-xl md:text-2xl font-bold">{'💬'} Nachrichten</h1>
        <div className="flex gap-2">
          {accounts.map(function(a) {
            return (
              <button key={a.id} onClick={function() { loadConversations(a.id) }}
                className={'text-xs px-3 py-1.5 rounded-lg font-medium ' + (activeAccount === a.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}>
                {a.name}
              </button>
            )
          })}
          <button onClick={refresh} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg">
            {'🔄'}
          </button>
        </div>
      </div>

      {status && (
        <div className="mb-2 p-2 rounded-lg text-xs bg-red-900/50 text-red-300 shrink-0">{status}</div>
      )}

      {/* Main Layout */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Konversations-Liste */}
        <div className="w-full md:w-80 shrink-0 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <div className="text-sm font-medium text-slate-300">
              {conversations.length} Konversation{conversations.length !== 1 ? 'en' : ''}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading === 'Lade Nachrichten...' ? (
              <div className="p-4 text-center text-slate-400 text-sm">{'⏳'} Lädt...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">Keine Nachrichten</div>
            ) : (
              conversations.map(function(conv) {
                return (
                  <div key={conv.id}
                    onClick={function() { openConversation(conv.id) }}
                    className={'p-3 cursor-pointer border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ' + (activeConvId === conv.id ? 'bg-blue-900/30 border-l-2 border-l-blue-500' : '')}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-slate-200 truncate">{conv.name}</div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {conv.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                        <span className="text-xs text-slate-500">{conv.date}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{conv.listing}</div>
                    {conv.last_message && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">{conv.last_message}</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Desktop Chat */}
        <div className="hidden md:flex flex-1 bg-slate-800 rounded-xl overflow-hidden flex-col">
          {activeConvId === null ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Wähle eine Konversation
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between shrink-0">
                <div>
                  <div className="font-medium text-sm">{activeConv ? activeConv.name : ''}</div>
                  <div className="text-xs text-slate-400">{activeConv ? activeConv.listing : ''}</div>
                </div>
                <span className={'text-xs px-2 py-0.5 rounded-full ' + (activeConv && activeConv.unread ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300')}>
                  {activeConv ? activeConv.date : ''}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading === 'Lade Chat...' ? (
                  <div className="text-center text-slate-400 text-sm">{'⏳'} Lädt...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm">Keine Nachrichten</div>
                ) : (
                  messages.map(function(msg, i) {
                    return (
                      <div key={i} className="flex justify-start">
                        <div className="bg-slate-700 rounded-lg px-3 py-2 max-w-[80%]">
                          <div className="text-sm text-slate-200">{msg.text}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="p-3 border-t border-slate-700 shrink-0">
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={function(e) { setReplyText(e.target.value) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') sendReply() }}
                    className={ic}
                    placeholder="Antwort schreiben..."
                  />
                  <button onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium shrink-0">
                    {'➤'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIX 2: CSS-Transform Mobile Chat Overlay — IMMER im DOM */}
      {createPortal(
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900 flex flex-col transition-transform duration-200"
          style={{
            transform: activeConvId !== null ? 'translateX(0)' : 'translateX(100%)',
            pointerEvents: activeConvId !== null ? 'auto' : 'none'
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-3 border-b border-slate-700 flex items-center gap-3">
            <button onClick={function() { flushSync(function() { setActiveConvId(null) }) }} className="text-slate-400 text-xl">{'←'}</button>
            <div>
              <div className="font-medium text-sm">{activeConv ? activeConv.name : ''}</div>
              <div className="text-xs text-slate-400">{activeConv ? activeConv.listing : ''}</div>
            </div>
          </div>

          {/* Scrollbarer Chat */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
            {loading === 'Lade Chat...' ? (
              <div className="text-center text-slate-400 text-sm">{'⏳'} Lädt...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm">Keine Nachrichten</div>
            ) : (
              messages.map(function(msg, i) {
                return (
                  <div key={i} className="bg-slate-700 rounded-lg px-3 py-2">
                    <div className="text-sm text-slate-200">{msg.text}</div>
                  </div>
                )
              })
            )}
            <div className="h-24" />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-slate-700" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
            <div className="flex gap-2">
              <input
                value={replyText}
                onChange={function(e) { setReplyText(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') sendReply() }}
                className={ic}
                placeholder="Antwort schreiben..."
              />
              <button onClick={sendReply}
                disabled={!replyText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium shrink-0">
                {'➤'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
