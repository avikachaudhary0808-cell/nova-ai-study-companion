import express from 'express'
import { registerUser, loginUser, getMe, logout, updateProfile, validateRegister, validateLogin } from '../controllers/authController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/register', validateRegister, registerUser)
router.post('/login', validateLogin, loginUser)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.put('/profile', protect, updateProfile)

export default router
