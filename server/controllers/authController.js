import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body
  if (!username || username.trim().length < 2) {
    res.status(400).json({ message: 'Username must be at least 2 characters' })
    return
  }
  if (!email.includes('@')) {
    res.status(400).json({ message: 'Please provide a valid email' })
    return
  }
  if (!password || password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' })
    return
  }
  next()
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body
  if (!email || !email.includes('@')) {
    res.status(400).json({ message: 'Please provide a valid email' })
    return
  }
  if (!password) {
    res.status(400).json({ message: 'Password is required' })
    return
  }
  next()
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({ username, email, password })

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out successfully' })
})

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user) {
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email })
      if (emailExists) {
        res.status(400)
        throw new Error('Email already in use')
      }
    }

    user.username = req.body.username || user.username
    user.email = req.body.email || user.email

    if (req.body.password) {
      if (req.body.password.length < 6) {
        res.status(400)
        throw new Error('Password must be at least 6 characters')
      }
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

export { registerUser, loginUser, getMe, logout, updateProfile, validateRegister, validateLogin }
