import express from 'express'
import { summarizeNote, explainTopic, generateFlashcards, createQuiz, answerQuestion } from '../controllers/aiController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/notes/:noteId/summarize', protect, summarizeNote)
router.post('/explain', protect, explainTopic)
router.post('/flashcards', protect, generateFlashcards)
router.post('/quiz', protect, createQuiz)
router.post('/ask', protect, answerQuestion)

export default router
