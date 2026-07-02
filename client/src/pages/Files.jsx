import { useState, useEffect, useRef } from 'react'
import { filesApi } from '../utils/api'
import {
  Upload,
  FileText,
  File,
  Trash2,
  Download,
  Heart,
  X,
  FileIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const EXT_ICON = {
  pdf: FileText,
  doc: File,
  docx: File,
  txt: FileText,
}

function FileCard({ file, onDelete, onToggleFavorite, onPreview }) {
  const Icon = EXT_ICON[file.extension] || File
  const isPdf = file.extension === 'pdf'
  const isText = file.extension === 'txt'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${isPdf ? 'bg-red-50 text-red-600' : isText ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-700'}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate pr-4">{file.originalName}</h3>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(file._id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
          {file.extension.toUpperCase()}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleFavorite(file._id)}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${file.favorite ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart className={`h-4 w-4 ${file.favorite ? 'fill-current' : ''}`} />
          </button>
          {(isPdf || isText) && (
            <button
              onClick={() => onPreview(file)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Preview"
            >
              <FileIcon className="h-4 w-4" />
            </button>
          )}
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/download`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

function PreviewModal({ file, onClose }) {
  const [error, setError] = useState('')
  const src = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/preview`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 min-w-0">
            <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 truncate">{file.originalName}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {error ? (
            <div className="flex items-center justify-center h-64 text-red-600 bg-white m-4 rounded-xl border border-dashed border-red-200">
              <div className="text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                <p className="font-medium">Preview unavailable</p>
                <p className="text-sm text-gray-500 mt-1">This file type may not be previewable.</p>
              </div>
            </div>
          ) : (
            <iframe
              src={src}
              title={file.originalName}
              className="w-full h-[70vh]"
              onError={() => setError('load')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Files() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const fileInputRef = useRef(null)

  const fetchFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await filesApi.getFiles()
      setFiles(data.files || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUpload = async (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const allowed = ACCEPTED_TYPES.some((type) => type === selected.type) || ['pdf', 'docx', 'doc', 'txt'].includes(selected.name.split('.').pop().toLowerCase())
    if (!allowed) {
      setError('Only PDF, DOCX, DOC, and TXT files are allowed')
      return
    }

    const formData = new FormData()
    formData.append('file', selected)

    setUploadLoading(true)
    setError('')
    try {
      const { data } = await filesApi.uploadFile(formData)
      setFiles((prev) => [data, ...prev])
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await filesApi.deleteFile(id)
      setFiles((prev) => prev.filter((f) => f._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete file')
    }
  }

  const handleToggleFavorite = async (id) => {
    try {
      const { data } = await filesApi.toggleFavorite(id)
      setFiles((prev) => prev.map((f) => (f._id === data._id ? data : f)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update favorite')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-600 mt-1">Upload, preview, download, and manage your study files</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {uploadLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span>{uploadLoading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="text-gray-600 mt-2">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No files yet</h3>
          <p className="text-gray-600 mb-6">Upload PDF, DOCX, or TXT files to access them here</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Your First File</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {files.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onPreview={setPreviewFile}
            />
          ))}
        </div>
      )}

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  )
}

export default Files
