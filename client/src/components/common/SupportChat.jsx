import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../hooks/useChat'

export default function SupportChat() {
  const { user, isLoggedIn } = useAuth()
  const token = isLoggedIn ? localStorage.getItem('token') : null
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)
  const prevMsgCount = useRef(0)

  const {
    connected,
    sessionId,
    messages,
    sessionClosed,
    closeReason,
    error,
    sendMessage,
    startNewSession,
  } = useChat(token, 'user')

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnread(0)
    }
  }, [messages, open])

  // Count unread admin messages when chat is closed
  useEffect(() => {
    if (!open && messages.length > prevMsgCount.current) {
      const newMsgs = messages.slice(prevMsgCount.current)
      const newAdminMsgs = newMsgs.filter((m) => m.sender === 'admin').length
      if (newAdminMsgs > 0) setUnread((u) => u + newAdminMsgs)
    }
    prevMsgCount.current = messages.length
  }, [messages, open])

  const handleOpen = () => {
    setOpen(true)
    setUnread(0)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const sent = sendMessage(input.trim())
    if (sent !== false) setInput('')
  }

  // Don't render for guests
  if (!isLoggedIn) return null

  const canSend = connected && sessionId && !sessionClosed
  const statusText = sessionClosed
    ? '🔴 Session ended'
    : connected && sessionId
    ? '🟢 Connected'
    : connected
    ? '🟡 Joining...'
    : '🔴 Offline'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {open && (
        <div
          className="w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ height: '460px' }}
        >
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div>
              <p className="font-semibold text-sm">Tap & Grab Support</p>
              <p className="text-xs opacity-80">{statusText}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="opacity-70 hover:opacity-100 text-xl leading-none w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 border-b border-red-100">
              ⚠️ {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 && !sessionClosed && (
              <div className="text-center text-gray-400 text-xs mt-10 px-4 space-y-1">
                <p className="text-2xl">👋</p>
                <p>Hi <strong>{user?.name}</strong>!</p>
                <p>Send a message and our team will reply shortly.</p>
                <p className="text-orange-400 mt-2">⏱ Auto-closes after 1 min of inactivity</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm break-words ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                  }`}
                >
                  {msg.sender === 'admin' && (
                    <p className="text-xs text-primary font-semibold mb-0.5">Support</p>
                  )}
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {sessionClosed && (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1.5 inline-block">
                  {closeReason}
                </p>
                <br />
                <button
                  onClick={startNewSession}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  + Start new session
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!sessionClosed && (
            <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-white flex-shrink-0">
              <input
                className="flex-1 border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={canSend ? 'Type a message...' : 'Connecting...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!canSend}
                autoFocus
              />
              <button
                type="submit"
                disabled={!canSend || !input.trim()}
                className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-colors flex-shrink-0"
              >
                ➤
              </button>
            </form>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-dark transition-colors relative"
      >
        {open ? '✕' : '💬'}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  )
}
