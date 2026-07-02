import asyncHandler from 'express-async-handler'
import Note from '../models/Note.js'

const getNotes = asyncHandler(async (req, res) => {
  const {
    search,
    filter,
    tag,
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    order = 'desc',
  } = req.query

  const userId = req.user.id
  const query = { user: userId }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ]
  }

  if (filter === 'pinned') {
    query.pinned = true
  } else if (filter === 'favorites') {
    query.favorite = true
  } else if (filter === 'archived') {
    query.archived = true
  }

  if (tag) {
    query.tags = { $in: [tag] }
  }

  const sortOrder = order === 'asc' ? 1 : -1
  const sort = {}
  if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'title') {
    sort[sortBy] = sortOrder
  } else {
    sort.updatedAt = -1
  }

  if (filter === 'pinned') {
    sort.pinned = -1
  }

  const notes = await Note.find(query)
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await Note.countDocuments(query)

  res.json({
    notes,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  })
})

const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (note) {
    res.json(note)
  } else {
    res.status(404)
    throw new Error('Note not found')
  }
})

const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, color } = req.body

  if (!title || !title.trim()) {
    res.status(400)
    throw new Error('Title is required')
  }

  if (!content || !content.trim()) {
    res.status(400)
    throw new Error('Content is required')
  }

  const note = await Note.create({
    user: req.user.id,
    title: title.trim(),
    content: content.trim(),
    tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
    color: color || 'default',
  })

  res.status(201).json(note)
})

const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!note) {
    res.status(404)
    throw new Error('Note not found')
  }

  const { title, content, tags, color } = req.body

  if (title !== undefined) {
    if (!title || !title.trim()) {
      res.status(400)
      throw new Error('Title cannot be empty')
    }
    note.title = title.trim()
  }

  if (content !== undefined) {
    if (!content || !content.trim()) {
      res.status(400)
      throw new Error('Content cannot be empty')
    }
    note.content = content.trim()
  }

  if (tags !== undefined) {
    note.tags = Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : []
  }

  if (color !== undefined) {
    note.color = color
  }

  if (req.body.pinned !== undefined) note.pinned = req.body.pinned
  if (req.body.favorite !== undefined) note.favorite = req.body.favorite

  const updatedNote = await note.save()

  res.json(updatedNote)
})

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!note) {
    res.status(404)
    throw new Error('Note not found')
  }

  await note.deleteOne()

  res.json({ message: 'Note deleted successfully' })
})

const togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!note) {
    res.status(404)
    throw new Error('Note not found')
  }

  note.pinned = !note.pinned
  await note.save()

  res.json({ _id: note._id, pinned: note.pinned })
})

const toggleFavorite = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user.id,
  })

  if (!note) {
    res.status(404)
    throw new Error('Note not found')
  }

  note.favorite = !note.favorite
  await note.save()

  res.json({ _id: note._id, favorite: note.favorite })
})

export {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleFavorite,
}
