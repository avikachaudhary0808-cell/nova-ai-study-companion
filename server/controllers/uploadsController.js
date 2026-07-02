import asyncHandler from 'express-async-handler'
import path from 'path'
import fs from 'fs'
import UploadedFile from '../models/UploadedFile.js'

const DEFAULT_ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']

const ensureUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  return uploadsDir
}

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error('No file uploaded')
  }

  const mime = req.file.mimetype || ''
  const ext = path.extname(req.file.originalname).slice(1).toLowerCase()
  if (!DEFAULT_ALLOWED.includes(mime) && !['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
    fs.unlinkSync(req.file.path)
    res.status(400)
    throw new Error('Unsupported file type')
  }

  const file = await UploadedFile.create({
    user: req.user._id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: mime,
    size: req.file.size,
    extension: ext,
    path: req.file.path.replace(/\\/g, '/'),
  })

  res.status(201).json(file)
})

const getFiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const files = await UploadedFile.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await UploadedFile.countDocuments({ user: req.user._id })

  res.json({
    files,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    total,
  })
})

const getFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id })
  if (!file) {
    res.status(404)
    throw new Error('File not found')
  }
  res.json(file)
})

const downloadFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id })
  if (!file) {
    res.status(404)
    throw new Error('File not found')
  }

  const absolute = path.join(process.cwd(), file.path)
  if (!fs.existsSync(absolute)) {
    res.status(404)
    throw new Error('File not found on disk')
  }

  res.download(absolute, file.originalName)
})

const previewFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id })
  if (!file) {
    res.status(404)
    throw new Error('File not found')
  }

  const absolute = path.join(process.cwd(), file.path)
  if (!fs.existsSync(absolute)) {
    res.status(404)
    throw new Error('File not found on disk')
  }

  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  const stream = fs.createReadStream(absolute)
  stream.pipe(res)
})

const deleteFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id })
  if (!file) {
    res.status(404)
    throw new Error('File not found')
  }

  const absolute = path.join(process.cwd(), file.path)
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute)
  }

  await file.deleteOne()
  res.json({ message: 'File deleted successfully' })
})

const toggleFavorite = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id })
  if (!file) {
    res.status(404)
    throw new Error('File not found')
  }

  file.favorite = !file.favorite
  await file.save()
  res.json({ _id: file._id, favorite: file.favorite })
})

export { uploadFile, getFiles, getFile, downloadFile, previewFile, deleteFile, toggleFavorite, ensureUploadsDir }
