import { useState, useEffect, useCallback, useRef } from 'react'
import flashcardsApi, { aiApi, notesApi, filesApi } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Shuffle, CheckCircle2, XCircle, RotateCcw, Sparkles, Save, BookOpen } from 'lucide-react'

const SOURCE_MODES = [
  { key: 'topic', label: 'Topic' },
  { key: 'note', label: 'Note' },
  { key: 'file', label: 'File' },
]

function FlipCard({ card, isFlipped, onFlip, learned, onToggleLearned }) {
  return (
    <div className="relative w-full max-w-xl mx-auto" style={{ perspective: '1200px' }}>
      <div
        onClick={onFlip}
        className={`relative w-full transition-transform duration-500 cursor-pointer`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
        }}
      >
        <div
          className="absolute inset-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500">Question</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLearned(learned ? false : true) }}
              className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                learned ? 'border-green-500 text-green-700 bg-green-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{learned ? 'Learned' : 'Mark learned'}</span>
            </button>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed text-center">{card.question}</p>
        </div>

        <div
          className="absolute inset-0 bg-primary-600 text-white border border-primary-700 rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-primary-100">Answer</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLearned(learned ? false : true) }}
              className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                learned ? 'border-green-300 text-green-100 bg-green-900/20' : 'border-primary-400 text-primary-100 hover:border-primary-300'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{learned ? 'Learned' : 'Mark learned'}</span>
            </button>
          </div>
          <p className="text-lg sm:text-xl font-semibold leading-relaxed text-center">{card.answer}</p>
        </div>
      </div>
    </div>
  )
}

function Flashcards() {
  const [sourceMode, setSourceMode] = useState('topic')
  const [notes, setNotes] = useState([])
  const [files, setFiles] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [topic, setTopic] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState('')
  const [selectedFileId, setSelectedFileId] = useState('')
  const [count, setCount] = useState(10)

  const [session, setSession] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSession(null)
    setCurrentIndex(0)
    setIsFlipped(false)

    try {
      if (!selectedNoteId && !selectedFileId && !topic.trim()) {
        throw new Error('Select a note, file, or enter a topic')
      }

      const { data } = await aiApi.generateFlashcards({
        noteId: selectedNoteId || undefined,
        topic: topic.trim() || undefined,
        count,
      })

      const cards = (data.flashcards || []).map((c, idx) => ({
        question: c.question || `Flashcard ${idx + 1}`,
        answer: c.answer || '',
        learned: false,
        lastReviewedAt: null,
      }))

      const sessionData = {
        sourceType: selectedNoteId ? 'ai_note' : selectedFileId ? 'ai_file' : 'ai_topic',
        sourceId: selectedNoteId || selectedFileId || null,
        topic: topic.trim() || null,
        cards,
      }

      const { data: saved } = await flashcardsApi.createSession(sessionData)
      setSession(saved)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const toggleLearned = async (learned) => {
    if (!session) return
    try {
      const { data } = await flashcardsApi.updateCard(session._id, currentIndex, learned)
      setSession(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update flashcard')
    }
  }

  const handleShuffle = () => {
    if (!session || session.cards.length <= 1) return
    const shuffled = [...session.cards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setSession({ ...session, cards: shuffled })
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const goTo = (index) => {
    if (!session) return
    setCurrentIndex(((index % session.cards.length) + session.cards.length) % session.cards.length)
    setIsFlipped(false)
  }

  const current = session?.cards?.[currentIndex]
  const masteredCount = session?.cards?.filter((c) => c.learned)?.length || 0
  const totalCount = session?.cards?.length || 0
  const progress = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0

  if (session && current) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
            <p className="text-sm text-gray-600 mt-1">
              {session.topic || 'Flashcard Set'} • {masteredCount}/{totalCount} learned • {progress}%
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setSession(null); setIsFlipped(false); navigate('/dashboard/flashcards') }}
              className="inline-flex items-center space-x-1 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New Set</span>
            </button>
            <button
              onClick={handleShuffle}
              className="inline-flex items-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 text-sm"
            >
              <Shuffle className="h-4 w-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-3 text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        <div className="flex flex-col items-center">
          <FlipCard
            card={current}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((v) => !v)}
            learned={current.learned}
            onToggleLearned={toggleLearned}
          />

          <div className="flex items-center justify-between w-full max-w-xl mt-6">
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="inline-flex items-center space-x-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {totalCount}
            </span>

            <button
              onClick={() => goTo(currentIndex + 1)}
              className="inline-flex items-center space-x-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-4">
          <span className="text-xs text-gray-500 flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            Click card to flip
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-500 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
            Mark as learned to track progress
          </span>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-600 mt-1">Generate AI flashcards from a topic, note, or file</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-3 text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          {loadingOptions && <p className="text-sm text-gray-500">Loading notes and files…</p>}

          <div className="flex items-center space-x-2">
            {SOURCE_MODES.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setSourceMode(mode.key)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  sourceMode === mode.key
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {sourceMode === 'topic' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, React Hooks..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {sourceMode === 'note' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Note</label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a note</option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>{note.title}</option>
                ))}
              </select>
            </div>
          )}

          {sourceMode === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
              <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a file</option>
                {files.map((file) => (
                  <option key={file._id} value={file._id}>{file.originalName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Count: {count}</label>
            <input
              type="range"
              min={5}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Flashcards</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default Flashcards
