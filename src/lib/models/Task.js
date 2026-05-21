import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  assignedStaff: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['Marketing', 'Client Work', 'Internal', 'Sales Prospect', 'Partnership', 'Design', 'Development', 'General'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  week: {
    type: String,
    enum: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'None', ''],
    default: ''
  },
  month: {
    type: String, // e.g. "2026-05"
    required: [true, 'Month is required']
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: String,
    required: [true, 'Creator name is required']
  }
}, {
  timestamps: true
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
