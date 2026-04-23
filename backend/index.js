import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import scrapeRouter from './routes/scrape.js'
import regenRouter from './routes/regen.js'
import authRouter from './routes/auth.js'
import publishRouter from './routes/publish.js'
import { startScheduler } from './jobs/scheduler.js'
import imageRouter from './routes/image.js'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.set('trust proxy', 1)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
  },
}))

app.use('/api/scrape', scrapeRouter)
app.use('/api/regen', regenRouter)
app.use('/api/auth', authRouter)
app.use('/api/publish', publishRouter)
app.use('/api/image', imageRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))


startScheduler()
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app
