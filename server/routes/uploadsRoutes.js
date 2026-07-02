import express from 'express'
import multer from 'multer'
import path from 'path'
import { uploadFile, getFiles, getFile, downloadFile, previewFile, deleteFile, toggleFavorite } from '../controllers/uploadsController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'))
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    cb(null, unique)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
})

router.post('/', protect, upload.single('file'), uploadFile)
router.get('/', protect, getFiles)
router.get('/:id', protect, getFile)
router.get('/:id/download', protect, downloadFile)
router.get('/:id/preview', protect, previewFile)
router.delete('/:id', protect, deleteFile)
router.patch('/:id/favorite', protect, toggleFavorite)

export default router
