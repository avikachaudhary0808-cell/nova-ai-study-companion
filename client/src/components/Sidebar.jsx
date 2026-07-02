import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  FileText,
  FolderOpen,
  ClipboardList,
  BookMarked,
  Calendar,
  X,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'

function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/decks', icon: BookOpen, label: 'My Decks' },
    { path: '/dashboard/notes', icon: FileText, label: 'Notes' },
    { path: '/dashboard/files', icon: FolderOpen, label: 'Files' },
    { path: '/dashboard/planner', icon: Calendar, label: 'Study Planner' },
    { path: '/dashboard/quiz', icon: ClipboardList, label: 'Quiz' },
    { path: '/dashboard/flashcards', icon: BookMarked, label: 'Flashcards' },
    { path: '/dashboard/generate', icon: Sparkles, label: 'AI Generator' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { path: '/dashboard/help', icon: HelpCircle, label: 'Help' },
  ]

  const handleLogout = () => {
    logout()
    onMobileClose()
  }

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex-shrink-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {!isCollapsed && (
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">AI Study</span>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mx-auto flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            )}

            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) => `
                    relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isCollapsed ? 'justify-center' : ''}
                    ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}

                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:block hidden">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? <Moon className="h-5 w-5 mr-3" /> : <Sun className="h-5 w-5 mr-3" />}
              {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
            </button>

            {!isCollapsed && user && (
              <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
            {isCollapsed && user && (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              </div>
            )}

            {!isCollapsed ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

