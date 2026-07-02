import express from 'express'
import { createPlan, getPlans, getPlan, updatePlan, deletePlan, getStats } from '../controllers/studyPlannerController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createPlan)
router.get('/', protect, getPlans)
router.get('/stats', protect, getStats)
router.get('/:id', protect, getPlan)
router.put('/:id', protect, updatePlan)
router.delete('/:id', protect, deletePlan)

export default router
