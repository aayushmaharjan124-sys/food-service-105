const { ChatSession, ChatMessage, User } = require('../models/index')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

const TIMEOUT_MS = 60 * 1000 // 1 minute inactivity
const timers = {}

const clearTimer = (sessionId) => {
  if (timers[sessionId]) {
    clearTimeout(timers[sessionId])
    delete timers[sessionId]
  }
}

const resetTimer = (sessionId, io) => {
  clearTimer(sessionId)
  timers[sessionId] = setTimeout(async () => {
    await closeSession(sessionId, io, 'timeout')
  }, TIMEOUT_MS)
}

const closeSession = async (sessionId, io, reason = 'closed') => {
  clearTimer(sessionId)
  try {
    await ChatSession.update({ status: 'closed' }, { where: { id: sessionId } })
    io.to(`session_${sessionId}`).emit('session_closed', {
      sessionId,
      reason,
      message:
        reason === 'timeout'
          ? 'Session closed due to 1 minute of inactivity.'
          : 'Session closed by admin.',
    })
    // Remove from admin session list
    io.to('admin_room').emit('session_removed', { sessionId })
    console.log(`[chat] session ${sessionId} closed — ${reason}`)
  } catch (err) {
    console.error('[chat] closeSession error:', err.message)
  }
}

const verifySocket = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

const initSocket = (io) => {
  io.on('connection', async (socket) => {
    // ── Auth ──────────────────────────────────────────────────────────
    const token = socket.handshake.auth?.token
    const decoded = verifySocket(token)
    if (!decoded) {
      console.log('[chat] rejected — bad/missing token')
      return socket.disconnect(true)
    }

    const user = await User.findByPk(decoded.id).catch(() => null)
    if (!user) {
      console.log('[chat] rejected — user not found')
      return socket.disconnect(true)
    }

    console.log(`[chat] ✅ connected: ${user.name} (${user.role}) socket=${socket.id}`)

    // ── USER: join or resume session ──────────────────────────────────
    socket.on('user_join', async () => {
      if (user.role !== 'user') return

      try {
        // Resume existing active session or create new one
        let session = await ChatSession.findOne({
          where: { userId: user.id, status: 'active' },
        })
        if (!session) {
          session = await ChatSession.create({
            userId: user.id,
            lastActivityAt: new Date(),
          })
          console.log(`[chat] new session ${session.id} for ${user.name}`)
        } else {
          console.log(`[chat] resumed session ${session.id} for ${user.name}`)
        }

        socket.join(`session_${session.id}`)

        const history = await ChatMessage.findAll({
          where: { sessionId: session.id },
          order: [['createdAt', 'ASC']],
        })

        // Send session info + history back to user
        socket.emit('session_joined', {
          sessionId: session.id,
          history: history.map((m) => m.toJSON()),
        })

        // Notify admin room
        io.to('admin_room').emit('new_session', {
          sessionId: session.id,
          userId: user.id,
          userName: user.name,
          lastMessage: history.length ? history[history.length - 1].text : null,
        })

        resetTimer(session.id, io)
      } catch (err) {
        console.error('[chat] user_join error:', err.message)
        socket.emit('chat_error', { message: 'Failed to join session' })
      }
    })

    // ── ADMIN: join admin room ────────────────────────────────────────
    socket.on('admin_join', async () => {
      if (user.role !== 'admin') return

      socket.join('admin_room')
      console.log(`[chat] admin ${user.name} joined admin_room`)

      try {
        const activeSessions = await ChatSession.findAll({
          where: { status: 'active' },
          include: [{ model: User, attributes: ['id', 'name', 'email'] }],
          order: [['lastActivityAt', 'DESC']],
        })

        // For each session, get last message preview
        const sessionsWithPreview = await Promise.all(
          activeSessions.map(async (s) => {
            const lastMsg = await ChatMessage.findOne({
              where: { sessionId: s.id },
              order: [['createdAt', 'DESC']],
            })
            return {
              ...s.toJSON(),
              lastMessage: lastMsg?.text || null,
              unreadCount: await ChatMessage.count({
                where: { sessionId: s.id, sender: 'user' },
              }),
            }
          })
        )

        socket.emit('active_sessions', sessionsWithPreview)
      } catch (err) {
        console.error('[chat] admin_join error:', err.message)
      }
    })

    // ── ADMIN: open a specific session ────────────────────────────────
    socket.on('admin_open_session', async ({ sessionId }) => {
      if (user.role !== 'admin') return

      try {
        const session = await ChatSession.findByPk(sessionId)
        if (!session) return socket.emit('chat_error', { message: 'Session not found' })

        socket.join(`session_${sessionId}`)
        console.log(`[chat] admin ${user.name} opened session ${sessionId}`)

        const history = await ChatMessage.findAll({
          where: { sessionId },
          order: [['createdAt', 'ASC']],
        })

        socket.emit('session_history', {
          sessionId,
          status: session.status,
          history: history.map((m) => m.toJSON()),
        })
      } catch (err) {
        console.error('[chat] admin_open_session error:', err.message)
      }
    })

    // ── SEND MESSAGE (user or admin) ──────────────────────────────────
    socket.on('send_message', async ({ sessionId, text }) => {
      if (!text?.trim()) return

      try {
        const session = await ChatSession.findByPk(sessionId)

        if (!session) {
          return socket.emit('chat_error', { message: 'Session not found' })
        }
        if (session.status === 'closed') {
          return socket.emit('chat_error', { message: 'Session is closed. Start a new one.' })
        }

        // Security: user can only message their own session
        if (user.role === 'user' && Number(session.userId) !== Number(user.id)) {
          return socket.emit('chat_error', { message: 'Not authorized' })
        }

        const msg = await ChatMessage.create({
          sessionId,
          sender: user.role === 'admin' ? 'admin' : 'user',
          senderName: user.name,
          text: text.trim(),
        })

        await ChatSession.update(
          { lastActivityAt: new Date() },
          { where: { id: sessionId } }
        )

        const msgJSON = msg.toJSON()
        console.log(`[chat] 📨 ${user.role} "${user.name}" → session ${sessionId}: "${text.trim()}"`)

        // Broadcast to everyone in the session room (user socket + admin socket)
        io.to(`session_${sessionId}`).emit('new_message', msgJSON)

        // Update admin session list preview
        io.to('admin_room').emit('session_activity', {
          sessionId,
          lastMessage: text.trim(),
          sender: user.role,
        })

        resetTimer(sessionId, io)
      } catch (err) {
        console.error('[chat] send_message error:', err.message)
        socket.emit('chat_error', { message: 'Failed to send message' })
      }
    })

    // ── ADMIN: close session ──────────────────────────────────────────
    socket.on('close_session', async ({ sessionId }) => {
      if (user.role !== 'admin') return
      await closeSession(sessionId, io, 'closed by admin')
    })

    // ── Disconnect ────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[chat] ❌ disconnected: ${user.name} (${reason})`)
    })
  })

  // On startup: close sessions that timed out while server was down
  ChatSession.update(
    { status: 'closed' },
    {
      where: {
        status: 'active',
        lastActivityAt: { [Op.lt]: new Date(Date.now() - TIMEOUT_MS) },
      },
    }
  ).catch(() => {})
}

module.exports = { initSocket }
