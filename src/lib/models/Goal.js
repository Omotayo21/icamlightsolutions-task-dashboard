import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true
  },
  month: {
    type: String, // e.g. "2026-05"
    required: [true, 'Month is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: [true, 'Creator name is required']
  }
}, {
  timestamps: true
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
