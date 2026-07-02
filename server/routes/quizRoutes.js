import express from 'express'
import { startQuiz, submitQuiz, getHistory, getAttempt } from '../controllers/quizController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/start', protect, startQuiz)
router.post('/:attemptId/submit', protect, submitQuiz)
router.get('/history', protect, getHistory)
router.get('/:id', protect, getAttempt)

export default router
