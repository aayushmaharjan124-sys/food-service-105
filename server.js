const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

const { sequelize } = require('./models/index')
const { initSocket } = require('./services/chat.service')

const app = express()
const server = http.createServer(app)

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
})

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: 'Too many requests' },
})

app.use(generalLimiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth.routes'))
app.use('/api/users', require('./routes/user.routes'))
app.use('/api/products', require('./routes/product.routes'))
app.use('/api/categories', require('./routes/category.routes'))
app.use('/api/cart', require('./routes/cart.routes'))
app.use('/api/orders', require('./routes/order.routes'))
app.use('/api/messages', require('./routes/message.routes'))
app.use('/api/admin', require('./routes/admin.routes'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mysql', env: process.env.NODE_ENV }))

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found` }))

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  const status = err.status || 500
  res.status(status).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

initSocket(io)

sequelize.sync({ force: false })
  .then(() => {
    console.log('MySQL tables synced')
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT} [${process.env.NODE_ENV}]`)
    )
  })
  .catch((err) => {
    console.error('DB connection error:', err.message)
    process.exit(1)
  })
