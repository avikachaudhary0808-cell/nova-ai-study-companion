import { useState, useEffect } from 'react'
import { quizApi } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Trophy, Clock, Flame, ChevronRight, X, ClipboardList } from 'lucide-react'

function QuizHistory() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await quizApi.getHistory({ limit: 50 })
      setAttempts(data.attempts || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz history')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const sourceLabel = (attempt) => {
    if (attempt.sourceType === 'note') return 'From Note'
    if (attempt.sourceType === 'file') return 'From File'
    return attempt.topic || 'Topic'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
          <p className="text-gray-600 mt-1">Review your previous quiz attempts</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/quiz')}
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ClipboardList className="h-5 w-5" />
          <span>New Quiz</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="text-gray-600 mt-2">Loading history...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quiz attempts yet</h3>
          <p className="text-gray-600 mb-6">Complete a quiz to see your history here</p>
          <button
            onClick={() => navigate('/dashboard/quiz')}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span>Take Your First Quiz</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt._id}
              onClick={() => navigate(`/dashboard/quiz/attempt/${attempt._id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {sourceLabel(attempt)}: {attempt.topic || 'Quiz'}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(attempt.createdAt)}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <ClipboardList className="h-3 w-3 mr-1" />
                      {attempt.score.total} questions
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(attempt.timeTaken)}
                    </span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg border ${getScoreColor(attempt.score.percentage)}`}>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{attempt.score.percentage}%</p>
                    <p className="text-xs">{attempt.score.correct}/{attempt.score.total}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizHistory
