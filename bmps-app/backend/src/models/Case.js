const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    type: { type: String, enum: ['Complaint', 'Salary Dispute', 'Injury', 'Disciplinary', 'Repatriation', 'Documentation', 'Other'], default: 'Other' },
    source: { type: String, enum: ['Client', 'Worker', 'Agent', 'Internal', 'MOM/Authority'], default: 'Internal' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    status: { type: String, enum: ['Open', 'In Progress', 'Pending Info', 'Escalated', 'Resolved', 'Closed'], default: 'Open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    openDate: { type: Date, default: Date.now },
    dueDate: Date,
    closedDate: Date,
    resolution: String,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

caseSchema.index({ code: 'text', title: 'text' });

module.exports = mongoose.model('Case', caseSchema);
