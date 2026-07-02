import { useState, useEffect } from 'react'
import api from '../utils/api'
import { BarChart3, BookOpen, FileText, Brain, Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444']

function StatCard({ title, value, subtext, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children, subtitle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Analytics() {
  const [overview, setOverview] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [notesOverTime, setNotesOverTime] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        const [overviewRes, weeklyRes, quizRes, notesRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/weekly'),
          api.get('/analytics/quiz-history'),
          api.get('/analytics/notes-over-time'),
        ])
        setOverview(overviewRes.data)
        setWeekly(weeklyRes.data)
        setQuizHistory(quizRes.data)
        setNotesOverTime(notesRes.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const aiUsageData = [
    { name: 'Flashcards', value: overview?.flashcards?.total || 0 },
    { name: 'Quizzes', value: overview?.quizzes?.total || 0 },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your learning progress and activity</p>
        </div>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="text-gray-600 mt-2">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your learning progress and activity</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="ml-3 text-red-600 hover:text-red-800">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your learning progress and activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Notes" value={overview?.notes || 0} subtext="Total notes created" icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Files" value={overview?.files || 0} subtext="Uploaded files" icon={FileText} color="bg-purple-500" />
        <StatCard title="Quiz Avg" value={`${overview?.quizzes?.avgScore || 0}%`} subtext={`${overview?.quizzes?.completed || 0} completed`} icon={Target} color="bg-green-500" />
        <StatCard title="AI Sessions" value={(overview?.flashcards?.total || 0) + (overview?.quizzes?.total || 0)} subtext="Flashcards + Quizzes" icon={Brain} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Activity" subtitle="Your activity for the past 7 days">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="notes" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} name="Notes" />
              <Area type="monotone" dataKey="files" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Files" />
              <Area type="monotone" dataKey="quizzes" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Quizzes" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quiz Score History" subtitle="Your last 10 quiz scores">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quizHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="score" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Score %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Notes Over Time" subtitle="Notes created over the last 30 days">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={notesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="Notes" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI Feature Usage" subtitle="Flashcards vs Quizzes generated">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={aiUsageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {aiUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {overview?.plans && (
        <ChartCard title="Study Plan Progress" subtitle={`${overview.plans.completedTasks || 0} / ${overview.plans.tasks || 0} tasks completed`}>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overview.plans.tasks ? Math.round((overview.plans.completedTasks / overview.plans.tasks) * 100) : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {overview.plans.completed || 0} of {overview.plans.total || 0} plans completed
          </p>
        </ChartCard>
      )}
    </div>
  )
}

export default Analytics
