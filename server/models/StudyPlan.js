import mongoose from 'mongoose'

const studyPlanSchema = mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    tasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Task title cannot be more than 200 characters'],
        },
        subject: {
          type: String,
          trim: true,
          maxlength: [100, 'Subject cannot be more than 100 characters'],
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
        estimatedMinutes: {
          type: Number,
          min: 0,
          max: 480,
        },
        actualMinutes: {
          type: Number,
          min: 0,
        },
      },
    ],
    completedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

studyPlanSchema.index({ user: 1, date: -1 })
studyPlanSchema.index({ user: 1, createdAt: -1 })

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema)

export default StudyPlan
