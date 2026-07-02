import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './config/db.js'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middleware/error.js'
import { ensureUploadsDir } from './controllers/uploadsController.js'

dotenv.config()
connectDB()
ensureUploadsDir()

const app = express()

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', routes)

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
