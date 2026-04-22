import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useChat } from '../../hooks/useChat'

export default function AdminSupport() {
  const token = localStorage.getItem('token')
  const [input, setInput] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const bottomRef = useRef(null)

  const {
    connected,
    sessionId,
    messages,
    sessionClosed,
    activeSessions,
    error,
    sendMessage,
    openSession,
    closeSession,
  } = useChat(token, 'admin')

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectSession = (sid) => {
    setSelectedSessionId(sid)
    openSession(sid)
    setInput('')
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !sessionId) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleClose = (sid) => {
    if (!confirm('Close this support session?')) return
    closeSession(sid)
    if (selectedSessionId === sid) {
      setSelectedSessionId(null)
    }
  }

  const currentSession = activeSessions.find((s) => s.id === sessionId)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Support Chat</h1>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {connected ? '🟢 Live' : '🔴 Offline'}
        </span>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-4" style={{ height: '600px' }}>
        {/* ── Sessions sidebar ─────────────────────────────────────── */}
        <div className="w-64 bg-white rounded-xl shadow flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Active Sessions
            </p>
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeSessions.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeSessions.length === 0 ? (
              <div className="text-center text-gray-400 text-xs p-8 space-y-2">
                <p className="text-3xl">💬</p>
                <p>No active sessions</p>
                <p>Users will appear here when they open support chat</p>
              </div>
            ) : (
              activeSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    sessionId === s.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.User?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">#{s.id}</p>
                      {s.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{s.lastMessage}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClose(s.id) }}
                      className="text-red-400 hover:text-red-600 text-sm flex-shrink-0 w-5 h-5 flex items-center justify-center"
                      title="Close session"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat area ────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-xl shadow flex flex-col overflow-hidden">
          {!sessionId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center space-y-3">
                <p className="text-5xl">💬</p>
                <p className="font-medium">Select a session to start chatting</p>
                <p className="text-sm">
                  {activeSessions.length === 0
                    ? 'Waiting for users to connect...'
                    : `${activeSessions.length} session(s) waiting`}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
                <div>
                  <p className="font-semibold text-sm">
                    {currentSession?.User?.name || 'User'} — Session #{sessionId}
                  </p>
                  {sessionClosed && (
                    <p className="text-xs text-red-500">Session closed</p>
                  )}
                </div>
                {!sessionClosed && (
                  <button
                    onClick={() => handleClose(sessionId)}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1"
                  >
                    Close Session
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-8">
                    No messages yet. Say hello! 👋
                  </p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm break-words ${
                        msg.sender === 'admin'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow rounded-bl-sm border'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-0.5 ${msg.sender === 'admin' ? 'text-white/70' : 'text-primary'}`}>
                        {msg.senderName}
                      </p>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {sessionClosed ? (
                <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-500">
                  This session has been closed.
                </div>
              ) : (
                <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-white flex-shrink-0">
                  <input
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Reply to user..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || !connected}
                    className="bg-primary text-white px-5 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-primary-dark transition-colors"
                  >
                    Send
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
