import asyncHandler from 'express-async-handler'
import Note from '../models/Note.js'
import UploadedFile from '../models/UploadedFile.js'
import QuizAttempt from '../models/QuizAttempt.js'
import FlashcardSession from '../models/FlashcardSession.js'
import StudyPlan from '../models/StudyPlan.js'

const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const [notesCount, filesCount, quizzes, flashcards, plans] = await Promise.all([
    Note.countDocuments({ user: userId }),
    UploadedFile.countDocuments({ user: userId }),
    QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    FlashcardSession.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    StudyPlan.find({ user: userId }).sort({ date: -1 }).limit(30).lean(),
  ])

  const quizStats = quizzes.reduce((acc, q) => {
    acc.total += 1
    acc.avgScore += q.score.percentage || 0
    acc.completed += q.status === 'completed' ? 1 : 0
    return acc
  }, { total: 0, avgScore: 0, completed: 0 })

  const flashcardStats = flashcards.reduce((acc, f) => {
    acc.total += 1
    acc.mastered += f.masteredCount || 0
    return acc
  }, { total: 0, mastered: 0 })

  const planStats = plans.reduce((acc, p) => {
    acc.total += 1
    acc.completed += p.isCompleted ? 1 : 0
    acc.tasks += p.totalCount || 0
    acc.completedTasks += p.completedCount || 0
    return acc
  }, { total: 0, completed: 0, tasks: 0, completedTasks: 0 })

  res.json({
    notes: notesCount,
    files: filesCount,
    quizzes: {
      total: quizStats.total,
      completed: quizStats.completed,
      avgScore: quizStats.total ? Math.round(quizStats.avgScore / quizStats.total) : 0,
    },
    flashcards: flashcardStats,
    plans: planStats,
  })
})

const getWeeklyActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    return {
      date: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      notes: 0,
      files: 0,
      quizzes: 0,
      flashcards: 0,
      tasks: 0,
    }
  })

  const weekStart = new Date(weekData[0].date + 'T00:00:00')
  const weekEnd = new Date(weekData[6].date + 'T23:59:59')

  const [notes, files, quizzes, flashcards, plans] = await Promise.all([
    Note.find({ user: userId, createdAt: { $gte: weekStart, $lte: weekEnd } }).lean(),
    UploadedFile.find({ user: userId, createdAt: { $gte: weekStart, $lte: weekEnd } }).lean(),
    QuizAttempt.find({ user: userId, createdAt: { $gte: weekStart, $lte: weekEnd } }).lean(),
    FlashcardSession.find({ user: userId, createdAt: { $gte: weekStart, $lte: weekEnd } }).lean(),
    StudyPlan.find({ user: userId, createdAt: { $gte: weekStart, $lte: weekEnd } }).lean(),
  ])

  notes.forEach((n) => {
    const day = weekData.find((w) => w.date === n.createdAt.toISOString().split('T')[0])
    if (day) day.notes += 1
  })

  files.forEach((f) => {
    const day = weekData.find((w) => w.date === f.createdAt.toISOString().split('T')[0])
    if (day) day.files += 1
  })

  quizzes.forEach((q) => {
    const day = weekData.find((w) => w.date === q.createdAt.toISOString().split('T')[0])
    if (day) day.quizzes += 1
  })

  flashcards.forEach((f) => {
    const day = weekData.find((w) => w.date === f.createdAt.toISOString().split('T')[0])
    if (day) day.flashcards += 1
  })

  plans.forEach((p) => {
    const day = weekData.find((w) => w.date === p.createdAt.toISOString().split('T')[0])
    if (day) day.tasks += p.totalCount || 0
  })

  res.json(weekData)
})

const getQuizScoreHistory = asyncHandler(async (req, res) => {
  const quizzes = await QuizAttempt.find({ user: req.user._id, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  const data = quizzes.reverse().map((q) => ({
    date: q.createdAt.toISOString().split('T')[0],
    score: q.score.percentage || 0,
  }))

  res.json(data)
})

const getNotesOverTime = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(30).lean()

  const grouped = notes.reduce((acc, note) => {
    const date = note.createdAt.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const data = Object.entries(grouped).map(([date, count]) => ({ date, count }))
  res.json(data)
})

export { getOverview, getWeeklyActivity, getQuizScoreHistory, getNotesOverTime }
