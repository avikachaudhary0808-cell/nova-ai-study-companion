import { useAuth } from '../contexts/AuthContext'
import {
  BookOpen,
  Clock,
  Flame,
  Target,
  Plus,
  Sparkles,
  Upload,
  PlayCircle,
  FileText,
  Calendar,
  ChevronRight,
} from 'lucide-react'

const stats = [
  {
    title: 'Cards Studied',
    value: '1,284',
    change: '+12.5%',
    trend: 'up',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Study Time',
    value: '24.5h',
    change: '+8.2%',
    trend: 'up',
    icon: Clock,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Day Streak',
    value: '7 days',
    change: '+2',
    trend: 'up',
    icon: Flame,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    title: 'Accuracy',
    value: '87%',
    change: '+5.1%',
    trend: 'up',
    icon: Target,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
  },
]

const recentActivity = [
  { id: 1, action: 'Completed study session', deck: 'Medical Terms', time: '2 hours ago', cards: 25, accuracy: '92%' },
  { id: 2, action: 'Created new deck', deck: 'Biology 101', time: '5 hours ago', cards: 48 },
  { id: 3, action: 'AI generated flashcards', deck: 'Chemistry Notes', time: 'Yesterday', cards: 120 },
  { id: 4, action: 'Completed study session', deck: 'Physics Formulas', time: 'Yesterday', cards: 30, accuracy: '85%' },
  { id: 5, action: 'Achieved 7 day streak', deck: null, time: '2 days ago', cards: null },
  { id: 6, action: 'Created new deck', deck: 'History Timeline', time: '3 days ago', cards: 65 },
]

const quickActions = [
  { title: 'Create New Deck', description: 'Start with a blank deck or template', icon: Plus, path: '/dashboard/decks', color: 'from-blue-500 to-blue-600' },
  { title: 'AI Generate', description: 'Generate flashcards from text', icon: Sparkles, path: '/dashboard/generate', color: 'from-purple-500 to-purple-600' },
  { title: 'Upload PDF', description: 'Import study materials', icon: Upload, path: '/dashboard/generate', color: 'from-green-500 to-green-600' },
  { title: 'Study Now', description: 'Review your flashcards', icon: PlayCircle, path: '/dashboard/decks', color: 'from-orange-500 to-orange-600' },
]

const recommendedDecks = [
  { name: 'Medical Terminology', cards: 150, progress: 75 },
  { name: 'Biology 101', cards: 48, progress: 30 },
  { name: 'Physics Formulas', cards: 30, progress: 90 },
]

function StatCard({ stat, index }) {
  return (
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
          <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
        </div>
        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {stat.change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
    </div>
  )
}

function ActivityItem({ item }) {
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
        <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.action}</p>
        {item.deck && <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.deck}</p>}
        <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {item.time}
          </span>
          {item.cards && <span>{item.cards} cards</span>}
          {item.accuracy && <span className="text-green-600 font-medium">{item.accuracy} accuracy</span>}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ action }) {
  return (
    <button className="w-full text-left p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <action.icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{action.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{action.description}</p>
      <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
        Start
        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </button>
  )
}

function DeckProgress({ deck }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{deck.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{deck.cards} cards</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{deck.progress}%</span>
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${deck.progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {greeting()}, {user?.username || 'Student'}!
            </h1>
            <p className="text-primary-100 text-base sm:text-lg max-w-2xl">
              You're making great progress. Keep up the momentum and continue your learning journey today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-300" />
                <span className="font-semibold">7 Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} action={action} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your latest study actions</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <button className="w-full flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              View all activity
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Recommended Decks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Continue Studying</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pick up where you left off</p>
          </div>
          <div className="p-4 space-y-3">
            {recommendedDecks.map((deck) => (
              <DeckProgress key={deck.name} deck={deck} />
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <button className="w-full flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              View all decks
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
