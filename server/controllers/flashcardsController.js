import asyncHandler from 'express-async-handler'
import FlashcardSession from '../models/FlashcardSession.js'

const createSession = asyncHandler(async (req, res) => {
  const { sourceType, sourceId, topic, cards = [] } = req.body

  if (!cards.length) {
    res.status(400)
    throw new Error('No flashcards provided')
  }

  const session = await FlashcardSession.create({
    user: req.user._id,
    sourceType,
    sourceId: sourceId || null,
    topic: topic || null,
    cards: cards.map((c) => ({
      question: c.question,
      answer: c.answer,
      learned: false,
    })),
    totalCount: cards.length,
    masteredCount: 0,
    isCompleted: false,
  })

  res.status(201).json(session)
})

const getSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const sessions = await FlashcardSession.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await FlashcardSession.countDocuments({ user: req.user._id })
  res.json({ sessions, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1, total })
})

const getSession = asyncHandler(async (req, res) => {
  const session = await FlashcardSession.findOne({ _id: req.params.id, user: req.user._id })
  if (!session) {
    res.status(404)
    throw new Error('Flashcard session not found')
  }
  res.json(session)
})

const updateCard = asyncHandler(async (req, res) => {
  const session = await FlashcardSession.findOne({ _id: req.params.id, user: req.user._id })
  if (!session) {
    res.status(404)
    throw new Error('Flashcard session not found')
  }

  const { index, learned } = req.body
  if (typeof index !== 'number' || index < 0 || index >= session.cards.length) {
    res.status(400)
    throw new Error('Invalid card index')
  }

  session.cards[index].learned = Boolean(learned)
  session.cards[index].lastReviewedAt = new Date()

  session.masteredCount = session.cards.filter((c) => c.learned).length
  session.isCompleted = session.masteredCount === session.totalCount

  await session.save()

  res.json(session)
})

const deleteSession = asyncHandler(async (req, res) => {
  const session = await FlashcardSession.findOne({ _id: req.params.id, user: req.user._id })
  if (!session) {
    res.status(404)
    throw new Error('Flashcard session not found')
  }

  await session.deleteOne()
  res.json({ message: 'Flashcard session deleted successfully' })
})

export { createSession, getSessions, getSession, updateCard, deleteSession }
