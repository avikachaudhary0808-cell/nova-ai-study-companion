import { useState, useEffect } from 'react'
import { notesApi } from '../utils/api'
import { useToast } from '../components/ui/Toast'
import {
  Plus,
  Search,
  Filter,
  Pin,
  Heart,
  Trash2,
  Edit3,
  MoreVertical,
  Grid,
  List,
  ChevronDown,
  X,
  Tag,
  StickyNote,
  PinOff,
} from 'lucide-react'
import { ErrorMessage, Skeleton } from '../components/ui'

const NOTE_COLORS = {
  default: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
  red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  purple: 'bg-purple-50 border-purange-200 dark:bg-purple-900/20 dark:border-purple-800',
  pink: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
}

function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleFavorite, viewMode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const colorClass = NOTE_COLORS[note.color] || NOTE_COLORS.default

  if (viewMode === 'list') {
    return (
      <div className={`${colorClass} border rounded-xl p-4 hover:shadow-md transition-all duration-200 group dark:text-gray-100`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{note.title}</h3>
              {note.pinned && <Pin className="h-4 w-4 text-primary-600 flex-shrink-0" />}
              {note.favorite && <Heart className="h-4 w-4 text-red-500 flex-shrink-0 fill-current" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{note.content}</p>
            <div className="flex flex-wrap gap-1.5">
              {note.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                <button onClick={() => { onEdit(note); setMenuOpen(false) }} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
                <button onClick={() => { onTogglePin(note._id); setMenuOpen(false) }} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{note.pinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => { onToggleFavorite(note._id); setMenuOpen(false) }} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{note.favorite ? 'Unfavorite' : 'Favorite'}</button>
                <button onClick={() => { onDelete(note._id); setMenuOpen(false) }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${colorClass} border rounded-xl p-5 hover:shadow-lg transition-all duration-200 group relative flex flex-col h-64 dark:text-gray-100`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{note.title}</h3>
          {note.pinned && <Pin className="h-4 w-4 text-primary-600 flex-shrink-0" />}
          {note.favorite && <Heart className="h-4 w-4 text-red-500 flex-shrink-0 fill-current" />}
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 mb-3 flex-grow">{note.content}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {note.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
        <div className="flex items-center space-x-1">
          <button onClick={() => onTogglePin(note._id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${note.pinned ? 'text-primary-600' : 'text-gray-400'}`} title={note.pinned ? 'Unpin' : 'Pin'}>
            <Pin className="h-4 w-4" />
          </button>
          <button onClick={() => onToggleFavorite(note._id)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${note.favorite ? 'text-red-500' : 'text-gray-400'}`} title={note.favorite ? 'Unfavorite' : 'Favorite'}>
            <Heart className={`h-4 w-4 ${note.favorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => onEdit(note)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Edit">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(note._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </div>
  )
}

function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedTag, setSelectedTag] = useState('')
  const [allTags, setAllTags] = useState([])
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const fetchNotes = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: 12, sortBy: 'updatedAt', order: 'desc' }
      if (search.trim()) params.search = search.trim()
      if (filter !== 'all') params.filter = filter
      if (selectedTag) params.tag = selectedTag

      const { data } = await notesApi.getNotes(params)
      setNotes(data.notes || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)

      const tags = new Set()
      ;(data.notes || []).forEach((note) => {
        ;(note.tags || []).forEach((tag) => tags.add(tag))
      })
      setAllTags(Array.from(tags))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [filter, page, selectedTag])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchNotes()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSave = async (savedNote, deleted) => {
    if (deleted) {
      setNotes((prev) => prev.filter((n) => n._id !== savedNote?._id))
      setTotal((prev) => Math.max(0, prev - 1))
      addToast('Note deleted', 'success')
    } else if (savedNote) {
      setNotes((prev) => {
        const exists = prev.find((n) => n._id === savedNote._id)
        if (exists) {
          return prev.map((n) => (n._id === savedNote._id ? savedNote : n))
        }
        return [savedNote, ...prev]
      })
      setTotal((prev) => prev + 1)
      addToast(savedNote._id && notes.find((n) => n._id === savedNote._id) ? 'Note updated' : 'Note created', 'success')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      await notesApi.deleteNote(id)
      setNotes((prev) => prev.filter((n) => n._id !== id))
      setTotal((prev) => Math.max(0, prev - 1))
      addToast('Note deleted', 'success')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note')
    }
  }

  const handleTogglePin = async (id) => {
    try {
      const { data } = await notesApi.togglePin(id)
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)))
      addToast(data.pinned ? 'Note pinned' : 'Note unpinned', 'success')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pin')
    }
  }

  const handleToggleFavorite = async (id) => {
    try {
      const { data } = await notesApi.toggleFavorite(id)
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)))
      addToast(data.favorite ? 'Added to favorites' : 'Removed from favorites', 'success')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update favorite')
    }
  }

  const openCreate = () => {
    setEditingNote(null)
    setModalOpen(true)
  }

  const openEdit = (note) => {
    setEditingNote(note)
    setModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Notes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your study notes and ideas</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0">
          <Plus className="h-5 w-5" />
          <span>New Note</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title, content, or tags..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-gray-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white dark:bg-gray-900 dark:text-gray-100"
              >
                {FILTERS.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <Grid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTag === tag ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </button>
            ))}
            {selectedTag && (
              <button onClick={() => setSelectedTag('')} className="text-sm text-red-600 hover:text-red-700">Clear</button>
            )}
          </div>
        )}
      </div>

      {loading && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={200} rounded="lg" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <StickyNote className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No notes found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {search || filter !== 'all' || selectedTag ? 'Try adjusting your search or filters' : 'Create your first note to get started'}
          </p>
          {!search && filter === 'all' && !selectedTag && (
            <button onClick={openCreate} className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-5 w-5" />
              <span>Create Note</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing {notes.length} of {total} note{total !== 1 ? 's' : ''}</p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} viewMode="grid" onEdit={openEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} viewMode="list" onEdit={openEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:text-gray-300">Previous</button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg transition-colors ${page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:text-gray-300">Next</button>
            </div>
          )}
        </>
      )}

      <NoteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingNote(null)
        }}
        note={editingNote}
        onSaved={handleSave}
      />
    </div>
  )
}

export default Notes
