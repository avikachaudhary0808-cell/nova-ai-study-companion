import { useState, useEffect } from 'react'
import { plannerApi } from '../utils/api'
import { Calendar, Plus, Trash2, CheckCircle2, Circle, Clock, Target, TrendingUp, ChevronLeft, ChevronRight, Flame, Award, BookOpen } from 'lucide-react'

const PRIORITY_COLORS = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-yellow-200 bg-yellow-50',
  low: 'border-gray-200 bg-gray-50',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]
}

function StudyPlanner() {
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [plans, setPlans] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tasks, setTasks] = useState([
    { title: '', subject: '', priority: 'medium', estimatedMinutes: 30 }
  ])

  const fetchPlans = async (date) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await plannerApi.getPlans({ date })
      setPlans(data.plans || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await plannerApi.getStats({ period: 'week' })
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  useEffect(() => {
    fetchPlans(selectedDate)
    fetchStats()
  }, [selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    const validTasks = tasks.filter((t) => t.title.trim())
    if (validTasks.length === 0) {
      setError('Add at least one task')
      return
    }

    try {
      const { data } = await plannerApi.createPlan({
        title: title.trim(),
        description: description.trim(),
        date: selectedDate,
        tasks: validTasks,
      })
      setPlans((prev) => [data, ...prev])
      setTitle('')
      setDescription('')
      setTasks([{ title: '', subject: '', priority: 'medium', estimatedMinutes: 30 }])
      setShowForm(false)
      fetchStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan')
    }
  }

  const toggleTask = async (planId, taskIndex) => {
    try {
      const plan = plans.find((p) => p._id === planId)
      if (!plan) return

      const updatedTasks = [...plan.tasks]
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        completed: !updatedTasks[taskIndex].completed,
        completedAt: !updatedTasks[taskIndex].completed ? new Date() : null,
      }

      const { data } = await plannerApi.updatePlan(planId, { tasks: updatedTasks })
      setPlans((prev) => prev.map((p) => (p._id === planId ? data : p)))
      fetchStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task')
    }
  }

  const deletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    try {
      await plannerApi.deletePlan(planId)
      setPlans((prev) => prev.filter((p) => p._id !== planId))
      fetchStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan')
    }
  }

  const changeDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(formatDate(newDate))
  }

  const goToToday = () => {
    setSelectedDate(formatDate(new Date()))
  }

  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const isToday = selectedDate === formatDate(new Date())

  const daysInMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1).getDay()
  const currentMonth = selectedDateObj.getMonth()
  const currentYear = selectedDateObj.getFullYear()

  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const getTaskStatsForDate = (day) => {
    if (!day) return null
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayPlans = plans.filter((p) => p.date === dateStr)
    const totalTasks = dayPlans.reduce((sum, p) => sum + p.totalCount, 0)
    const completedTasks = dayPlans.reduce((sum, p) => sum + p.completedCount, 0)
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-600 mt-1">Plan your studies, track progress, and achieve your goals</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Plan</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-primary-600" />
              <span className="text-xs text-gray-500">This week</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedPlans}/{stats.totalPlans}</p>
            <p className="text-xs text-gray-600">Plans completed</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-500">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedTasks}/{stats.totalTasks}</p>
            <p className="text-xs text-gray-600">Tasks done</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="text-xs text-gray-500">Overall</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.overallPercentage}%</p>
            <p className="text-xs text-gray-600">Completion rate</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <Flame className="h-5 w-5 text-orange-600" />
              <span className="text-xs text-gray-500">Streak</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.streak}</p>
            <p className="text-xs text-gray-600">Day streak</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Study Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Study plan title..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Tasks</label>
                <button
                  type="button"
                  onClick={() => setTasks([...tasks, { title: '', subject: '', priority: 'medium', estimatedMinutes: 30 }])}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Task
                </button>
              </div>
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 border border-gray-100 rounded-lg">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => {
                        const updated = [...tasks]
                        updated[idx].title = e.target.value
                        setTasks(updated)
                      }}
                      placeholder="Task title..."
                      className="sm:col-span-4 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={task.subject}
                      onChange={(e) => {
                        const updated = [...tasks]
                        updated[idx].subject = e.target.value
                        setTasks(updated)
                      }}
                      placeholder="Subject..."
                      className="sm:col-span-3 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                      value={task.priority}
                      onChange={(e) => {
                        const updated = [...tasks]
                        updated[idx].priority = e.target.value
                        setTasks(updated)
                      }}
                      className="sm:col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="number"
                      value={task.estimatedMinutes}
                      onChange={(e) => {
                        const updated = [...tasks]
                        updated[idx].estimatedMinutes = Number(e.target.value)
                        setTasks(updated)
                      }}
                      placeholder="Min"
                      min={0}
                      className="sm:col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                      className="sm:col-span-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {MONTHS[currentMonth]} {currentYear}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isToday ? 'Today' : selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <button onClick={goToToday} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {isToday ? 'Selected' : 'Today'}
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="aspect-square" />
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isSelected = dateStr === selectedDate
                const isTodayDate = dateStr === formatDate(new Date())
                const progress = getTaskStatsForDate(day)

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-md'
                        : isTodayDate
                        ? 'border-2 border-primary-300 text-gray-900 hover:border-primary-400'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{day}</span>
                    {progress !== null && (
                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                        {progress}%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              <p className="text-gray-600 mt-2">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No plans for this day</h3>
              <p className="text-gray-600 mb-6">Create a study plan to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Plan</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const completedCount = plan.tasks?.filter((t) => t.completed).length || 0
                const totalCount = plan.totalCount || plan.tasks?.length || 0
                const percentage = plan.completionPercentage || (totalCount ? Math.round((completedCount / totalCount) * 100) : 0)

                return (
                  <div key={plan._id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                        {plan.description && <p className="text-sm text-gray-600 mb-2">{plan.description}</p>}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {totalCount} tasks
                          </span>
                          <span className="flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {completedCount} completed
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePlan(plan._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="space-y-2">
                      {(plan.tasks || []).map((task, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleTask(plan._id, idx)}
                          className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            task.completed ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="mt-0.5">
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              {task.subject && (
                                <span className="text-xs text-gray-500">{task.subject}</span>
                              )}
                              {task.estimatedMinutes > 0 && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.estimatedMinutes} min
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudyPlanner
