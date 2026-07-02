import asyncHandler from 'express-async-handler'
import StudyPlan from '../models/StudyPlan.js'

const calculateProgress = (tasks) => {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const percentage = total ? Math.round((completed / total) * 100) : 0
  return { total, completed, percentage }
}

const createPlan = asyncHandler(async (req, res) => {
  const { title, description, date, tasks = [] } = req.body

  if (!title || !title.trim()) {
    res.status(400)
    throw new Error('Title is required')
  }

  if (!date) {
    res.status(400)
    throw new Error('Date is required')
  }

  const planDate = new Date(date)
  const normalizedDate = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate())

  const processedTasks = tasks.map((task) => ({
    title: task.title?.trim() || '',
    subject: task.subject?.trim() || '',
    priority: task.priority || 'medium',
    completed: false,
    estimatedMinutes: Number(task.estimatedMinutes) || 0,
    actualMinutes: 0,
  }))

  const { total, completed, percentage } = calculateProgress(processedTasks)

  const plan = await StudyPlan.create({
    user: req.user._id,
    title: title.trim(),
    description: description?.trim() || '',
    date: normalizedDate,
    tasks: processedTasks,
    completedCount: completed,
    totalCount: total,
    completionPercentage: percentage,
  })

  res.status(201).json(plan)
})

const getPlans = asyncHandler(async (req, res) => {
  const { date, startDate, endDate, page = 1, limit = 20 } = req.query
  const query = { user: req.user._id }

  if (date) {
    const planDate = new Date(date)
    const normalized = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate())
    const nextDay = new Date(normalized)
    nextDay.setDate(nextDay.getDate() + 1)
    query.date = { $gte: normalized, $lt: nextDay }
  } else if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    query.date = { $gte: start, $lte: end }
  }

  const plans = await StudyPlan.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await StudyPlan.countDocuments(query)

  res.json({
    plans,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    total,
  })
})

const getPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id })
  if (!plan) {
    res.status(404)
    throw new Error('Study plan not found')
  }
  res.json(plan)
})

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id })
  if (!plan) {
    res.status(404)
    throw new Error('Study plan not found')
  }

  const { title, description, date, tasks } = req.body

  if (title !== undefined) {
    if (!title || !title.trim()) {
      res.status(400)
      throw new Error('Title is required')
    }
    plan.title = title.trim()
  }

  if (description !== undefined) plan.description = description?.trim() || ''
  if (date !== undefined) {
    const planDate = new Date(date)
    plan.date = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate())
  }

  if (tasks !== undefined) {
    const processedTasks = tasks.map((task) => ({
      title: task.title?.trim() || '',
      subject: task.subject?.trim() || '',
      priority: task.priority || 'medium',
      completed: Boolean(task.completed),
      completedAt: task.completed ? (task.completedAt || new Date()) : null,
      estimatedMinutes: Number(task.estimatedMinutes) || 0,
      actualMinutes: Number(task.actualMinutes) || 0,
    }))

    plan.tasks = processedTasks
    const { total, completed, percentage } = calculateProgress(processedTasks)
    plan.totalCount = total
    plan.completedCount = completed
    plan.completionPercentage = percentage
    plan.isCompleted = total > 0 && completed === total
  } else {
    const { total, completed, percentage } = calculateProgress(plan.tasks)
    plan.totalCount = total
    plan.completedCount = completed
    plan.completionPercentage = percentage
    plan.isCompleted = total > 0 && completed === total
  }

  await plan.save()
  res.json(plan)
})

const deletePlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id })
  if (!plan) {
    res.status(404)
    throw new Error('Study plan not found')
  }

  await plan.deleteOne()
  res.json({ message: 'Study plan deleted successfully' })
})

const getStats = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query

  let startDate
  const now = new Date()

  if (period === 'week') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
  } else if (period === 'month') {
    startDate = new Date(now)
    startDate.setMonth(now.getMonth() - 1)
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const plans = await StudyPlan.find({
    user: req.user._id,
    date: { $gte: startDate, $lte: now },
  })

  const totalPlans = plans.length
  const completedPlans = plans.filter((p) => p.isCompleted).length
  const totalTasks = plans.reduce((sum, p) => sum + p.totalCount, 0)
  const completedTasks = plans.reduce((sum, p) => sum + p.completedCount, 0)
  const overallPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  const dailyData = plans.reduce((acc, plan) => {
    const dateKey = plan.date.toISOString().split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = { date: dateKey, total: 0, completed: 0 }
    acc[dateKey].total += plan.totalCount
    acc[dateKey].completed += plan.completedCount
    return acc
  }, {})

  const streak = calculateStreak(plans)

  res.json({
    totalPlans,
    completedPlans,
    totalTasks,
    completedTasks,
    overallPercentage,
    dailyData: Object.values(dailyData),
    streak,
  })
})

const calculateStreak = (plans) => {
  const completedDays = new Set(plans.filter((p) => p.isCompleted).map((p) => p.date.toISOString().split('T')[0]))
  if (completedDays.size === 0) return 0

  const sortedDates = Array.from(completedDays).sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i])
    const previous = new Date(sortedDates[i + 1])
    const diff = (current - previous) / (1000 * 60 * 60 * 24)
    if (Math.abs(diff - 1) < 0.5) streak++
    else break
  }

  return streak
}

export { createPlan, getPlans, getPlan, updatePlan, deletePlan, getStats }
