import express from 'express'
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleFavorite,
} from '../controllers/notesController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.route('/').get(protect, getNotes).post(protect, createNote)
router.route('/:id').get(protect, getNote).put(protect, updateNote).delete(protect, deleteNote)
router.route('/:id/pin').patch(protect, togglePin)
router.route('/:id/favorite').patch(protect, toggleFavorite)

export default router
