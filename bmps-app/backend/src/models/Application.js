const mongoose = require('mongoose');

const STATUS_FLOW = [
  'Draft', 'Submitted', 'Shortlisted', 'Interview Scheduled', 'Interview Passed',
  'IPA Applied', 'IPA Approved', 'Medical Scheduled', 'Medical Passed',
  'Work Pass Issued', 'Deployment Scheduled', 'Deployed', 'Active Worker',
  'Rejected', 'Cancelled'
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    jobDemand: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDemand', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' },
    country: String,
    permitType: String,
    sourceType: { type: String, enum: ['Direct', 'Agent Sourced'], default: 'Direct' },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    submissionDate: Date,
    interviewDate: Date,
    decisionDate: Date,
    currentStatus: { type: String, enum: STATUS_FLOW, default: 'Draft' },
    cancellationReason: String,
    notes: String,
    statusHistory: [statusHistorySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

applicationSchema.statics.STATUS_FLOW = STATUS_FLOW;
applicationSchema.index({ code: 'text' });

module.exports = mongoose.model('Application', applicationSchema);
