import mongoose from 'mongoose'

const quizAttemptSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['note', 'file', 'topic'],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'quizAttempt.sourceType',
      required: true,
    },
    topic: String,
    questions: [
      {
        question: String,
        options: [String],
        answer: String,
        explanation: String,
        userAnswer: String,
        isCorrect: Boolean,
      },
    ],
    score: {
      correct: Number,
      total: Number,
      percentage: Number,
    },
    timeTaken: Number,
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
)

quizAttemptSchema.index({ user: 1, createdAt: -1 })
quizAttemptSchema.index({ user: 1, status: 1 })

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema)

export default QuizAttempt
