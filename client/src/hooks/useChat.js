import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'

export const useChat = (token, role) => {
  const socketRef = useRef(null)
  const sessionIdRef = useRef(null)

  const [connected, setConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [sessionClosed, setSessionClosed] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [activeSessions, setActiveSessions] = useState([])
  const [error, setError] = useState(null)

  // Keep ref in sync with state (avoids stale closure in callbacks)
  const setSession = (sid) => {
    sessionIdRef.current = sid
    setSessionId(sid)
  }

  useEffect(() => {
    if (!token) {
      // Clean up if token removed (logout)
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnected(false)
      setSession(null)
      setMessages([])
      return
    }

    // Disconnect existing socket before creating new one
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[chat] ✅ connected', socket.id)
      setConnected(true)
      setError(null)

      // Re-join on reconnect
      if (role === 'user') socket.emit('user_join')
      if (role === 'admin') socket.emit('admin_join')
    })

    socket.on('connect_error', (err) => {
      console.error('[chat] ❌ connect error:', err.message)
      setConnected(false)
      setError('Cannot connect to support server')
    })

    socket.on('disconnect', (reason) => {
      console.log('[chat] disconnected:', reason)
      setConnected(false)
    })

    // ── USER events ───────────────────────────────────────────────────
    socket.on('session_joined', ({ sessionId: sid, history }) => {
      console.log('[chat] session_joined sid=', sid, 'msgs=', history.length)
      setSession(sid)
      setMessages(history)
      setSessionClosed(false)
      setCloseReason('')
    })

    socket.on('new_message', (msg) => {
      console.log('[chat] new_message from', msg.sender, ':', msg.text)
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    socket.on('session_closed', ({ sessionId: sid, message }) => {
      console.log('[chat] session_closed:', message)
      if (role === 'user') {
        setSessionClosed(true)
        setCloseReason(message || 'Session ended.')
        setSession(null)
      }
    })

    socket.on('chat_error', ({ message }) => {
      console.error('[chat] server error:', message)
      setError(message)
    })

    // ── ADMIN events ──────────────────────────────────────────────────
    socket.on('active_sessions', (sessions) => {
      console.log('[chat] active_sessions:', sessions.length)
      setActiveSessions(sessions)
    })

    socket.on('new_session', (session) => {
      console.log('[chat] new_session:', session.sessionId, session.userName)
      setActiveSessions((prev) => {
        if (prev.some((s) => s.id === session.sessionId)) return prev
        return [
          {
            id: session.sessionId,
            userId: session.userId,
            User: { name: session.userName },
            status: 'active',
            lastMessage: session.lastMessage,
          },
          ...prev,
        ]
      })
    })

    socket.on('session_activity', ({ sessionId: sid, lastMessage }) => {
      setActiveSessions((prev) =>
        prev.map((s) => (s.id === sid ? { ...s, lastMessage } : s))
      )
    })

    socket.on('session_removed', ({ sessionId: sid }) => {
      setActiveSessions((prev) => prev.filter((s) => s.id !== sid))
      if (sessionIdRef.current === sid) {
        setSession(null)
        setMessages([])
      }
    })

    socket.on('session_history', ({ sessionId: sid, history, status }) => {
      console.log('[chat] session_history sid=', sid, 'msgs=', history.length, 'status=', status)
      setSession(sid)
      setMessages(history)
      setSessionClosed(status === 'closed')
    })

    return () => {
      console.log('[chat] cleanup — disconnecting socket')
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, role]) // reconnect when token or role changes

  // ── Actions ───────────────────────────────────────────────────────────────

  const sendMessage = useCallback((text) => {
    const sid = sessionIdRef.current
    if (!socketRef.current?.connected) {
      console.warn('[chat] sendMessage: not connected')
      return false
    }
    if (!sid) {
      console.warn('[chat] sendMessage: no sessionId')
      return false
    }
    if (!text?.trim()) return false

    socketRef.current.emit('send_message', { sessionId: sid, text: text.trim() })
    return true
  }, [])

  const openSession = useCallback((sid) => {
    if (!socketRef.current?.connected) return
    setSession(sid)
    setMessages([])
    setSessionClosed(false)
    socketRef.current.emit('admin_open_session', { sessionId: sid })
  }, [])

  const closeSession = useCallback((sid) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit('close_session', { sessionId: sid })
    // UI update happens via session_removed event from server
  }, [])

  const startNewSession = useCallback(() => {
    if (!socketRef.current?.connected) return
    setSessionClosed(false)
    setCloseReason('')
    setMessages([])
    setSession(null)
    socketRef.current.emit('user_join')
  }, [])

  return {
    connected,
    sessionId,
    messages,
    sessionClosed,
    closeReason,
    activeSessions,
    error,
    sendMessage,
    openSession,
    closeSession,
    startNewSession,
  }
}
