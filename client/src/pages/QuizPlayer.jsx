import { useState, useEffect, useCallback, useRef } from 'react'
import { quizApi, notesApi, filesApi } from '../utils/api'
import { Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, Flame } from 'lucide-react'

const DEFAULT_TIME_PER_QUESTION = 30

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function QuizPlayer() {
  const [notes, setNotes] = useState([])
  const [files, setFiles] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [topic, setTopic] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState('')
  const [selectedFileId, setSelectedFileId] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [timeLimit, setTimeLimit] = useState(0)

  const [attempt, setAttempt] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [startTime, setStartTime] = useState(null)

  const timerRef = useRef(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      setError('')
      try {
        const [notesRes, filesRes] = await Promise.all([
          notesApi.getNotes({ limit: 50 }),
          filesApi.getFiles({ limit: 50 }),
        ])
        setNotes(notesRes.data.notes || [])
        setFiles(filesRes.data.files || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load options')
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startTimer = useCallback(
    (seconds) => {
      clearTimer()
      setTimeLeft(seconds)
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearTimer()
            handleAutoSubmit()
            return 0
          }
          return t - 1
        })
      }, 1000)
    },
    [clearTimer]
  )

  const handleAutoSubmit = useCallback(async () => {
    if (!attempt || submitted) return
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    await submit({ answers, timeTaken: elapsed })
  }, [attempt, submitted, startTime, answers])

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      if (!selectedNoteId && !selectedFileId && !topic.trim()) {
        throw new Error('Select a note, file, or enter a topic')
      }
      const { data } = await quizApi.start({
        noteId: selectedNoteId || undefined,
        fileId: selectedFileId || undefined,
        topic: topic.trim() || undefined,
        count: questionCount,
      })
      setAttempt(data)
      setCurrentIndex(0)
      setAnswers({})
      setSubmitted(false)
      setStartTime(Date.now())
      const total = timeLimit || data.questions.length * DEFAULT_TIME_PER_QUESTION
      startTimer(total)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (finalAnswers, timeTaken) => {
    clearTimer()
    setSubmitted(true)
    setLoading(true)
    try {
      const { data } = await quizApi.submit(attempt._id, {
        answers: finalAnswers,
        timeTaken,
      })
      setAttempt(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (option) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }))
  }

  const handleNext = () => {
    if (currentIndex < attempt.questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }

  const reset = () => {
    clearTimer()
    setAttempt(null)
    setCurrentIndex(0)
    setAnswers({})
    setSubmitted(false)
    setError('')
  }

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>
          <p className="text-gray-600 mt-1">Generate an MCQ quiz and test your knowledge</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">✕</button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          {loadingOptions && <p className="text-sm text-gray-500">Loading notes and files…</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Note (optional)</label>
              <select
                value={selectedNoteId}
                onChange={(e) => { setSelectedNoteId(e.target.value); setSelectedFileId('') }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">None</option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>{note.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From File (optional)</label>
              <select
                value={selectedFileId}
                onChange={(e) => { setSelectedFileId(e.target.value); setSelectedNoteId('') }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">None</option>
                {files.map((file) => (
                  <option key={file._id} value={file._id}>{file.originalName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Or Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Questions: {questionCount}</label>
              <input
                type="range"
                min={3}
                max={15}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time limit (sec per question, 0 = none)</label>
              <input
                type="number"
                min={0}
                max={300}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'Starting…' : 'Start Quiz'}
          </button>
        </div>
      </div>
    )
  }

  if (submitted || attempt.status === 'completed') {
    const { score, questions } = attempt
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${score.percentage >= 70 ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete</h2>
          <p className="text-5xl font-bold text-primary-600 mb-2">{score.percentage}%</p>
          <p className="text-gray-600">
            {score.correct} / {score.total} correct • {formatTime(attempt.timeTaken)}
          </p>
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={reset}
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New Quiz</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {(questions || []).map((q, idx) => {
            const selected = answers[idx]
            const isCorrect = selected === q.answer
            return (
              <div key={idx} className={`bg-white border rounded-xl p-5 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-gray-900 flex-1 pr-4">
                    {idx + 1}. {q.question}
                  </p>
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {(q.options || []).map((opt, oi) => {
                    let className = 'text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700'
                    if (opt === q.answer) className = 'border-green-500 bg-green-50 text-green-800'
                    else if (opt === selected && !isCorrect) className = 'border-red-500 bg-red-50 text-red-800'
                    return <div key={oi} className={className}>{opt}</div>
                  })}
                </div>
                {q.explanation && <p className="text-xs text-gray-600 mt-2">Explanation: {q.explanation}</p>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const current = attempt.questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = attempt.questions.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question {currentIndex + 1} / {totalQuestions}</h1>
          <p className="text-sm text-gray-600">{answeredCount} answered</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
          <Clock className="h-5 w-5" />
          <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <p className="text-lg font-medium text-gray-900">{current.question}</p>
        <div className="grid grid-cols-1 gap-3">
          {(current.options || []).map((option, idx) => {
            const selected = answers[currentIndex] === option
            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option}</span>
                  {selected && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center space-x-1 bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => submit(answers, Math.round((Date.now() - startTime) / 1000))}
              disabled={loading}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPlayer
