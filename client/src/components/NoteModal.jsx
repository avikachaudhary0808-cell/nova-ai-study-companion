import { useState, useEffect } from 'react'
import api from '../utils/api'
import { X, Tag, Save, Trash2, Bold, Italic, List } from 'lucide-react'

const COLORS = [
  { name: 'default', value: 'bg-white', border: 'border-gray-200' },
  { name: 'red', value: 'bg-red-50', border: 'border-red-200' },
  { name: 'orange', value: 'bg-orange-50', border: 'border-orange-200' },
  { name: 'yellow', value: 'bg-yellow-50', border: 'border-yellow-200' },
  { name: 'green', value: 'bg-green-50', border: 'border-green-200' },
  { name: 'blue', value: 'bg-blue-50', border: 'border-blue-200' },
  { name: 'purple', value: 'bg-purple-50', border: 'border-purple-200' },
  { name: 'pink', value: 'bg-pink-50', border: 'border-pink-200' },
]

function NoteModal({ isOpen, onClose, note, onSaved }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [color, setColor] = useState('default')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setTagsInput((note.tags || []).join(', '))
      setColor(note.color || 'default')
    } else {
      setTitle('')
      setContent('')
      setTagsInput('')
      setColor('default')
    }
    setError('')
  }, [note, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setLoading(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      if (note) {
        const { data } = await api.put(`/notes/${note._id}`, {
          title,
          content,
          tags,
          color,
        })
        onSaved(data)
      } else {
        const { data } = await api.post('/notes', {
          title,
          content,
          tags,
          color,
        })
        onSaved(data)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!note || !note._id) return
    if (!confirm('Are you sure you want to delete this note?')) return

    setLoading(true)
    try {
      await api.delete(`/notes/${note._id}`)
      onSaved(null, true)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              rows="6"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex items-center space-x-2 mt-2 text-gray-400">
              <button type="button" className="p-1.5 rounded hover:bg-gray-100">
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100">
                <Italic className="h-4 w-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Add tags separated by commas"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex items-center space-x-3">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-8 h-8 rounded-full border-2 ${c.value} ${c.border} ${
                    color === c.name ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                  } transition-all`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {note && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NoteModal;
