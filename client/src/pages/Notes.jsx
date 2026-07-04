import { useState, useEffect } from 'react'
import { notesApi } from '../utils/api'
import { useToast } from '../components/ui/Toast'
import NoteModal from '../components/NoteModal'
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
} from 'lucide-react'
import { ErrorMessage, Skeleton } from '../components/ui'

const FILTERS = [
  { key: 'all', label: 'All Notes' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'archived', label: 'Archived' },
]

const NOTE_COLORS = {
  default: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
  red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  pink: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
}

function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleFavorite, viewMode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const colorClass = NOTE_COLORS[note.color] || NOTE_COLORS.default

  return (
    <div className={`${colorClass} border rounded-xl p-4 relative group`}>
      <div className="flex justify-between">
        <h3 className="font-semibold">{note.title}</h3>

        <button onClick={() => setMenuOpen(!menuOpen)}>
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-2 top-10 bg-white border rounded shadow z-10">
            <button onClick={() => onEdit(note)} className="block px-3 py-1">Edit</button>
            <button onClick={() => onTogglePin(note._id)} className="block px-3 py-1">
              {note.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button onClick={() => onToggleFavorite(note._id)} className="block px-3 py-1">
              {note.favorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button onClick={() => onDelete(note._id)} className="block px-3 py-1 text-red-500">
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="text-sm mt-2 line-clamp-3">{note.content}</p>

      <div className="flex gap-2 mt-2 flex-wrap">
        {(note.tags || []).map((tag) => (
          <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTag, setSelectedTag] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [error, setError] = useState('')

  const { addToast } = useToast()

  const fetchNotes = async () => {
    try {
      setLoading(true)

      const params = {
        page,
        limit: 12,
        sortBy: 'updatedAt',
        order: 'desc',
      }

      if (search) params.search = search
      if (filter !== 'all') params.filter = filter
      if (selectedTag) params.tag = selectedTag

      const { data } = await notesApi.getNotes(params)

      setNotes(data.notes || [])
      setTotalPages(data.pages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [filter, page, selectedTag])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchNotes()
    }, 300)

    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id) => {
    try {
      await notesApi.deleteNote(id)
      setNotes((prev) => prev.filter((n) => n._id !== id))
      addToast('Deleted', 'success')
    } catch (err) {
      addToast('Delete failed', 'error')
    }
  }

  const handleTogglePin = async (id) => {
    try {
      const { data } = await notesApi.togglePin(id)
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, pinned: data.pinned } : n)))
    } catch {}
  }

  const handleToggleFavorite = async (id) => {
    try {
      const { data } = await notesApi.toggleFavorite(id)
      setNotes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, favorite: data.favorite } : n))
      )
    } catch {}
  }

  const handleSave = (savedNote, deleted) => {
    if (deleted) {
      setNotes((prev) => prev.filter((n) => n._id !== savedNote?._id))
    } else if (savedNote) {
      setNotes((prev) => {
        const exists = prev.find((n) => n._id === savedNote._id)
        if (exists) {
          return prev.map((n) => (n._id === savedNote._id ? savedNote : n))
        }
        return [savedNote, ...prev]
      })
    }
    setModalOpen(false)
    setEditingNote(null)
  }

  return (
    <div className="p-6">
      {error && <ErrorMessage message={error} />}

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button onClick={() => setModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
          <Plus size={16} /> New
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTER */}
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        {FILTERS.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>

      {/* NOTES */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={setEditingNote}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <NoteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          note={editingNote}
          onSaved={handleSave}
        />
      )}
    </div>
  )
}