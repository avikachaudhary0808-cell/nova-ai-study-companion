import { useState, useEffect } from 'react'
import { notesApi, filesApi, aiApi } from '../utils/api'
import { Sparkles, Loader2, AlertCircle, FileText, BookOpen, HelpCircle, ClipboardList, MessageSquare } from 'lucide-react'

const TOOLS = [
  { key: 'summarize', label: 'Summarize Note', icon: FileText, description: 'Get a concise summary of a note' },
  { key: 'explain', label: 'Explain Topic', icon: BookOpen, description: 'Get a clear explanation of any topic' },
  { key: 'flashcards', label: 'Generate Flashcards', icon: ClipboardList, description: 'Create study flashcards from content' },
  { key: 'quiz', label: 'Create Quiz', icon: ClipboardList, description: 'Generate a quiz from a note or file' },
  { key: 'ask', label: 'Ask Question', icon: MessageSquare, description: 'Ask a question from a note or file' },
]

function ResultCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{children}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-10 text-gray-600">
      <Loader2 className="h-6 w-6 animate-spin mr-3" />
      <span className="text-sm">Generating…</span>
    </div>
  )
}

function ErrorMessage({ message, onDismiss }) {
  return (
    <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">{message}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-3 text-red-600 hover:text-red-800">
          ✕
        </button>
      )}
    </div>
  )
}

function AIPage() {
  const [activeTool, setActiveTool] = useState('summarize')
  const [notes, setNotes] = useState([])
  const [files, setFiles] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [selectedNoteId, setSelectedNoteId] = useState('')
  const [selectedFileId, setSelectedFileId] = useState('')
  const [topic, setTopic] = useState('')
  const [question, setQuestion] = useState('')
  const [flashcardCount, setFlashcardCount] = useState(10)
  const [quizCount, setQuizCount] = useState(5)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleRun = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      if (activeTool === 'summarize') {
        if (!selectedNoteId) throw new Error('Select a note to summarize')
        const { data } = await aiApi.summarizeNote(selectedNoteId)
        setResult(data)
      } else if (activeTool === 'explain') {
        if (!topic.trim()) throw new Error('Enter a topic to explain')
        const { data } = await aiApi.explainTopic(topic.trim())
        setResult(data)
      } else if (activeTool === 'flashcards') {
        if (!selectedNoteId && !topic.trim()) throw new Error('Select a note or enter a topic')
        const { data } = await aiApi.generateFlashcards({
          noteId: selectedNoteId || undefined,
          topic: topic.trim() || undefined,
          count: flashcardCount,
        })
        setResult(data)
      } else if (activeTool === 'quiz') {
        if (!selectedNoteId && !selectedFileId && !topic.trim()) throw new Error('Select a note, file, or enter a topic')
        const { data } = await aiApi.createQuiz({
          noteId: selectedNoteId || undefined,
          fileId: selectedFileId || undefined,
          topic: topic.trim() || undefined,
          count: quizCount,
        })
        setResult(data)
      } else if (activeTool === 'ask') {
        if (!question.trim()) throw new Error('Enter your question')
        if (!selectedNoteId && !selectedFileId) throw new Error('Select a note or file to answer from')
        const { data } = await aiApi.answerQuestion({
          noteId: selectedNoteId || undefined,
          fileId: selectedFileId || undefined,
          question: question.trim(),
        })
        setResult(data)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedNoteId('')
    setSelectedFileId('')
    setTopic('')
    setQuestion('')
    setFlashcardCount(10)
    setQuizCount(5)
    setResult(null)
    setError('')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Generator</h1>
        <p className="text-gray-600 mt-1">Use AI to summarize, explain, generate flashcards, quizzes, and more.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.key}
            onClick={() => {
              setActiveTool(tool.key)
              resetForm()
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
              activeTool === tool.key
                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <tool.icon className="h-6 w-6 mb-2" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {loadingOptions && (
        <div className="text-center py-8 text-sm text-gray-500">Loading notes and files…</div>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        {activeTool === 'summarize' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Select Note</label>
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a note</option>
              {notes.map((note) => (
                <option key={note._id} value={note._id}>
                  {note.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTool === 'explain' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, Newton’s Laws..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {activeTool === 'flashcards' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Note (optional)</label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None</option>
                  {notes.map((note) => (
                    <option key={note._id} value={note._id}>
                      {note.title}
                    </option>
                  ))}
                </select>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count: {flashcardCount}</label>
              <input
                type="range"
                min={5}
                max={20}
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTool === 'quiz' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Note (optional)</label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None</option>
                  {notes.map((note) => (
                    <option key={note._id} value={note._id}>
                      {note.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source File (optional)</label>
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None</option>
                  {files.map((file) => (
                    <option key={file._id} value={file._id}>
                      {file.originalName}
                    </option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Questions: {quizCount}</label>
              <input
                type="range"
                min={3}
                max={10}
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTool === 'ask' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Note</label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => {
                    setSelectedNoteId(e.target.value)
                    setSelectedFileId('')
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None</option>
                  {notes.map((note) => (
                    <option key={note._id} value={note._id}>
                      {note.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From File</label>
                <select
                  value={selectedFileId}
                  onChange={(e) => {
                    setSelectedFileId(e.target.value)
                    setSelectedNoteId('')
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">None</option>
                  {files.map((file) => (
                    <option key={file._id} value={file._id}>
                      {file.originalName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something based on the selected note or file..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <LoadingState />}

      {!loading && result && (
        <div className="space-y-4">
          {activeTool === 'summarize' && (
            <ResultCard title="Summary">{result.summary}</ResultCard>
          )}

          {activeTool === 'explain' && (
            <ResultCard title="Explanation">{result.explanation}</ResultCard>
          )}

          {activeTool === 'flashcards' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Flashcards</h3>
              {(result.flashcards || []).map((card, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Q: {card.question}</p>
                  <p className="text-sm text-gray-700">A: {card.answer}</p>
                </div>
              ))}
            </div>
          )}

          {activeTool === 'quiz' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quiz</h3>
              {(result.quiz || []).map((q, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {(q.options || []).map((opt, oi) => (
                      <div
                        key={oi}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          opt === q.answer ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <p className="text-xs text-gray-600 mt-2">Explanation: {q.explanation}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTool === 'ask' && (
            <ResultCard title="Answer">{result.answer}</ResultCard>
          )}
        </div>
      )}
    </div>
  )
}

export default AIPage
