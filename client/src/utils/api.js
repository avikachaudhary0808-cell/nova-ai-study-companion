import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export async function requestWithToast(requestFn, successMessage, errorMessage, addToast) {
  try {
    const response = await requestFn()
    if (successMessage) {
      addToast?.(successMessage, 'success')
    }
    return response
  } catch (err) {
    const message = err.response?.data?.message || errorMessage || 'Something went wrong'
    addToast?.(message, 'error')
    throw err
  }
}

export const notesApi = {
  getNotes: (params) => api.get('/notes', { params }),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: (data) => api.post('/notes', data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
  toggleFavorite: (id) => api.patch(`/notes/${id}/favorite`),
}

export const filesApi = {
  getFiles: (params) => api.get('/files', { params }),
  getFile: (id) => api.get(`/files/${id}`),
  uploadFile: (formData) => api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteFile: (id) => api.delete(`/files/${id}`),
  toggleFavorite: (id) => api.patch(`/files/${id}/favorite`),
}

export const aiApi = {
  summarizeNote: (noteId) => api.post(`/ai/notes/${noteId}/summarize`),
  explainTopic: (topic) => api.post('/ai/explain', { topic }),
  generateFlashcards: (payload) => api.post('/ai/flashcards', payload),
  createQuiz: (payload) => api.post('/ai/quiz', payload),
  answerQuestion: (payload) => api.post('/ai/ask', payload),
}

export const quizApi = {
  start: (payload) => api.post('/quiz/start', payload),
  submit: (attemptId, payload) => api.post(`/quiz/${attemptId}/submit`, payload),
  getHistory: (params) => api.get('/quiz/history', { params }),
  getAttempt: (id) => api.get(`/quiz/${id}`),
}

export const flashcardsApi = {
  createSession: (payload) => api.post('/flashcards', payload),
  getSessions: (params) => api.get('/flashcards', { params }),
  getSession: (id) => api.get(`/flashcards/${id}`),
  updateCard: (sessionId, index, learned) => api.put(`/flashcards/${sessionId}/card`, { index, learned }),
  deleteSession: (id) => api.delete(`/flashcards/${id}`),
}

export const plannerApi = {
  createPlan: (payload) => api.post('/planner', payload),
  getPlans: (params) => api.get('/planner', { params }),
  getStats: (params) => api.get('/planner/stats', { params }),
  getPlan: (id) => api.get(`/planner/${id}`),
  updatePlan: (id, payload) => api.put(`/planner/${id}`, payload),
  deletePlan: (id) => api.delete(`/planner/${id}`),
}

export default api
