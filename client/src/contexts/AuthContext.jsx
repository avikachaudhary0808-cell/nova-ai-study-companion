import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data)
          setLoading(false)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, username, _id } = res.data
    localStorage.setItem('token', token)
    setUser({ _id, email, username })
    navigate('/dashboard')
  }

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    const { token, username: returnedUsername, _id } = res.data
    localStorage.setItem('token', token)
    setUser({ _id, email, username: returnedUsername })
    navigate('/dashboard')
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      navigate('/')
    }
  }

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  const value = { user, login, register, logout, updateUser, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
