import asyncHandler from 'express-async-handler'
import Note from '../models/Note.js'
import UploadedFile from '../models/UploadedFile.js'
import fs from 'fs'
import path from 'path'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

const geminiRequest = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Gemini API error:', error)
    throw new Error('Failed to get response from AI service')
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Empty response from AI service')
  }

  return text
}

const summarizeNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params

  const note = await Note.findOne({
    _id: noteId,
    user: req.user._id,
  })

  if (!note) {
    res.status(404)
    throw new Error('Note not found')
  }

  const prompt = `Summarize the following study note concisely, keeping the key points:\n\nTitle: ${note.title}\n\nContent:\n${note.content}`

  const summary = await geminiRequest(prompt)

  res.json({
    _id: note._id,
    title: note.title,
    summary,
  })
})

const explainTopic = asyncHandler(async (req, res) => {
  const { topic } = req.body

  if (!topic || !topic.trim()) {
    res.status(400)
    throw new Error('Topic is required')
  }

  const prompt = `Explain the following topic in simple, clear terms suitable for a student. Include key concepts, examples, and any important details:\n\n${topic.trim()}`

  const explanation = await geminiRequest(prompt)

  res.json({
    topic: topic.trim(),
    explanation,
  })
})

const generateFlashcards = asyncHandler(async (req, res) => {
  const { noteId, topic, count = 10 } = req.body

  let context = ''

  if (noteId) {
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
    })

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    context = `From the following study note titled "${note.title}":\n\n${note.content}`
  } else if (topic) {
    context = `On the topic: ${topic}`
  } else {
    res.status(400)
    throw new Error('Either noteId or topic is required')
  }

  const prompt = `Generate ${count} flashcards from the following content.
Return ONLY valid JSON in this exact format, with no markdown formatting:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}

Content:
${context}`

  const raw = await geminiRequest(prompt)

  let parsed
  try {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw]
    const jsonStr = match[1] || raw
    parsed = JSON.parse(jsonStr)
  } catch {
    parsed = { flashcards: raw.split('\n').filter(Boolean) }
  }

  if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
    parsed = { flashcards: raw.split('\n').filter(Boolean).map((line) => ({ question: line, answer: '' })) }
  }

  res.json(parsed)
})

const createQuiz = asyncHandler(async (req, res) => {
  const { noteId, fileId, topic, count = 5 } = req.body

  let context = ''

  if (noteId) {
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
    })

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    context = `From the following study note titled "${note.title}":\n\n${note.content}`
  } else if (fileId) {
    const file = await UploadedFile.findOne({
      _id: fileId,
      user: req.user._id,
    })

    if (!file) {
      res.status(404)
      throw new Error('File not found')
    }

    const absolute = path.join(process.cwd(), file.path)
    if (!fs.existsSync(absolute)) {
      res.status(404)
      throw new Error('File not found on disk')
    }

    const content = fs.readFileSync(absolute, 'utf-8')
    context = `From the uploaded file "${file.originalName}":\n\n${content}`
  } else if (topic) {
    context = `On the topic: ${topic}`
  } else {
    res.status(400)
    throw new Error('Either noteId, fileId, or topic is required')
  }

  const prompt = `Create ${count} multiple-choice quiz questions from the following content.
Return ONLY valid JSON in this exact format, with no markdown formatting:
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

  let parsed
  try {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw]
    const jsonStr = match[1] || raw
    parsed = JSON.parse(jsonStr)
  } catch {
    parsed = { quiz: raw.split('\n').filter(Boolean).map((line) => ({ question: line, options: [], answer: '', explanation: '' })) }
  }

  if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
    parsed = { quiz: raw.split('\n').filter(Boolean).map((line) => ({ question: line, options: [], answer: '', explanation: '' })) }
  }

  res.json(parsed)
})

const answerQuestion = asyncHandler(async (req, res) => {
  const { noteId, fileId, question } = req.body

  if (!question || !question.trim()) {
    res.status(400)
    throw new Error('Question is required')
  }

  let context = ''

  if (noteId) {
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
    })

    if (!note) {
      res.status(404)
      throw new Error('Note not found')
    }

    context = `From the following study note titled "${note.title}":\n\n${note.content}`
  } else if (fileId) {
    const file = await UploadedFile.findOne({
      _id: fileId,
      user: req.user._id,
    })

    if (!file) {
      res.status(404)
      throw new Error('File not found')
    }

    const absolute = path.join(process.cwd(), file.path)
    if (!fs.existsSync(absolute)) {
      res.status(404)
      throw new Error('File not found on disk')
    }

    const content = fs.readFileSync(absolute, 'utf-8')
    context = `From the uploaded file "${file.originalName}":\n\n${content}`
  } else {
    res.status(400)
    throw new Error('Either noteId or fileId is required')
  }

  const prompt = `Answer the following question based ONLY on the provided context. If the context does not contain the answer, say so honestly and provide general knowledge if possible.
Context:
${context}

Question: ${question.trim()}`

  const answer = await geminiRequest(prompt)

  res.json({
    question: question.trim(),
    answer,
  })
})

export {
  summarizeNote,
  explainTopic,
  generateFlashcards,
  createQuiz,
  answerQuestion,
}
