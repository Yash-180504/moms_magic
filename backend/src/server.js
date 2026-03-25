import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import providerRoutes from './routes/providers.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import uploadRoutes from './routes/upload.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/providers', providerRoutes)
app.use('/api', menuRoutes)          // mounts /api/providers/:providerId/menu + /api/menu/:id
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🍱 Mom's Magic backend running on http://localhost:${PORT}`)
})
