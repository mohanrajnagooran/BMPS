const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Follow-up', 'Document Collection', 'Call', 'Meeting', 'Compliance', 'Processing', 'Internal', 'Other'], default: 'Other' },
    relatedModule: { type: String, enum: ['Client', 'ClientCompany', 'JobDemand', 'Candidate', 'Application', 'Worker', 'Case', 'Agent', 'General'], default: 'General' },
    relatedRecord: { type: mongoose.Schema.Types.ObjectId },
    relatedRecordLabel: { type: String }, // denormalized display label (e.g. the client company name, the application code)
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    startDate: Date,
    dueDate: Date,
    completedDate: Date,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled'], default: 'Pending' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

taskSchema.index({ code: 'text', title: 'text' });

module.exports = mongoose.model('Task', taskSchema);
