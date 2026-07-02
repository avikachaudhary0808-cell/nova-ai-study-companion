import express from 'express'
import authRoutes from './authRoutes.js'
import notesRoutes from './notesRoutes.js'
import uploadsRoutes from './uploadsRoutes.js'
import aiRoutes from './aiRoutes.js'
import quizRoutes from './quizRoutes.js'
import flashcardsRoutes from './flashcardsRoutes.js'
import studyPlannerRoutes from './studyPlannerRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/notes', notesRoutes)
router.use('/files', uploadsRoutes)
router.use('/ai', aiRoutes)
router.use('/quiz', quizRoutes)
router.use('/flashcards', flashcardsRoutes)
router.use('/planner', studyPlannerRoutes)
router.use('/analytics', analyticsRoutes)

export default router
