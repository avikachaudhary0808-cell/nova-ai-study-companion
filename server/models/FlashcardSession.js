import mongoose from 'mongoose'

const flashcardSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['ai_topic', 'ai_note', 'ai_file'],
      required: true,
    },
    sourceId: String,
    topic: String,
    cards: [
      {
        question: String,
        answer: String,
        learned: { type: Boolean, default: false },
        lastReviewedAt: Date,
      },
    ],
    masteredCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

flashcardSessionSchema.index({ user: 1, createdAt: -1 })
flashcardSessionSchema.index({ user: 1, updatedAt: -1 })

const FlashcardSession = mongoose.model('FlashcardSession', flashcardSessionSchema)

export default FlashcardSession
