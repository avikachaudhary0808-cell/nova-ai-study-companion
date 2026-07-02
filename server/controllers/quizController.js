import asyncHandler from 'express-async-handler'
import QuizAttempt from '../models/QuizAttempt.js'
import Note from '../models/Note.js'
import UploadedFile from '../models/UploadedFile.js'
import fs from 'fs'
import path from 'path'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

const ensureGeminiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key not configured')
  return apiKey
}

const geminiRequest = async (prompt) => {
  const apiKey = ensureGeminiKey()
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Gemini API error:', error)
    throw new Error('Failed to get response from AI service')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from AI service')
  return text
}

const parseQuizJSON = (raw) => {
  try {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = match ? match[1].trim() : raw.trim()
    const parsed = JSON.parse(jsonStr)
    if (Array.isArray(parsed.quiz)) return parsed.quiz
    if (Array.isArray(parsed.questions)) return parsed.questions
    if (Array.isArray(parsed)) return parsed
    throw new Error('Invalid quiz format')
  } catch {
    const lines = raw.split('\n').filter(Boolean)
    return lines.map((line) => ({ question: line, options: [], answer: '', explanation: '' }))
  }
}

const buildContext = async (userId, noteId, fileId, topic) => {
  if (noteId) {
    const note = await Note.findOne({ _id: noteId, user: userId })
    if (!note) throw new Error('Note not found')
    return `From the study note titled "${note.title}":\n\n${note.content}`
  }
  if (fileId) {
    const file = await UploadedFile.findOne({ _id: fileId, user: userId })
    if (!file) throw new Error('File not found')
    const absolute = path.join(process.cwd(), file.path)
    if (!fs.existsSync(absolute)) throw new Error('File not found on disk')
    const content = fs.readFileSync(absolute, 'utf-8')
    return `From the uploaded file titled "${file.originalName}":\n\n${content}`
  }
  if (topic) return `On the topic: ${topic}`
  throw new Error('Either noteId, fileId, or topic is required')
}

const startQuiz = asyncHandler(async (req, res) => {
  const { noteId, fileId, topic, count = 5 } = req.body
  const context = await buildContext(req.user._id, noteId, fileId, topic)

  const prompt = `Create ${count} multiple-choice quiz questions from the following content.
Return ONLY valid JSON in this exact format:
{
  "quiz": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "..."
    }
  ]
}

Content:
${context}`

  const raw = await geminiRequest(prompt)
  const questions = parseQuizJSON(raw)

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    sourceType: noteId ? 'note' : fileId ? 'file' : 'topic',
    sourceId: noteId || fileId || null,
    topic: topic || null,
    questions: questions.map((q) => ({
      question: q.question,
      options: q.options || [],
      answer: q.answer || '',
      explanation: q.explanation || '',
    })),
    score: { correct: 0, total: questions.length, percentage: 0 },
    timeTaken: 0,
    status: 'in_progress',
  })

  res.status(201).json(attempt)
})

const submitQuiz = asyncHandler(async (req, res) => {
  const { attemptId } = req.params
  const { answers, timeTaken } = req.body

  const attempt = await QuizAttempt.findOne({ _id: attemptId, user: req.user._id })
  if (!attempt) { res.status(404); throw new Error('Quiz attempt not found') }
  if (attempt.status === 'completed') { res.status(400); throw new Error('Quiz already submitted') }

  let correct = 0
  const updatedQuestions = attempt.questions.map((q, idx) => {
    const userAnswer = answers?.[idx] || ''
    const isCorrect = userAnswer === q.answer
    if (isCorrect) correct++
    return { ...q, userAnswer, isCorrect }
  })

  const percentage = Math.round((correct / updatedQuestions.length) * 100)

  attempt.questions = updatedQuestions
  attempt.score = { correct, total: updatedQuestions.length, percentage }
  attempt.timeTaken = Number(timeTaken) || 0
  attempt.status = 'completed'
  await attempt.save()

  res.json(attempt)
})

const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const attempts = await QuizAttempt.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await QuizAttempt.countDocuments({ user: req.user._id })
  res.json({ attempts, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1, total })
})

const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.id, user: req.user._id })
  if (!attempt) { res.status(404); throw new Error('Quiz attempt not found') }
  res.json(attempt)
})

export { startQuiz, submitQuiz, getHistory, getAttempt }
