import express from 'express'
import { createSession, getSessions, getSession, updateCard, deleteSession } from '../controllers/flashcardsController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createSession)
router.get('/', protect, getSessions)
router.get('/:id', protect, getSession)
router.put('/:id/card', protect, updateCard)
router.delete('/:id', protect, deleteSession)

export default router
