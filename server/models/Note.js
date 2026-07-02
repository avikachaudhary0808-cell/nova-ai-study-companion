import mongoose from 'mongoose'

const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot be more than 50 characters'],
      },
    ],
    color: {
      type: String,
      default: 'default',
    },
  },
  {
    timestamps: true,
  }
)

noteSchema.index({ user: 1, createdAt: -1 })
noteSchema.index({ user: 1, pinned: -1, createdAt: -1 })

const Note = mongoose.model('Note', noteSchema)

export default Note
