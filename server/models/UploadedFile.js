import mongoose from 'mongoose'
import path from 'path'

const fileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

fileSchema.index({ user: 1, createdAt: -1 })

const UploadedFile = mongoose.model('UploadedFile', fileSchema)

export default UploadedFile
