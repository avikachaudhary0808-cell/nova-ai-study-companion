import express from 'express'
import { getOverview, getWeeklyActivity, getQuizScoreHistory, getNotesOverTime } from '../controllers/analyticsController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.get('/overview', protect, getOverview)
router.get('/weekly', protect, getWeeklyActivity)
router.get('/quiz-history', protect, getQuizScoreHistory)
router.get('/notes-over-time', protect, getNotesOverTime)

export default router
