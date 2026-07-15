const mongoose = require('mongoose');

const historyEntry = (extra = {}) =>
  new mongoose.Schema(
    {
      date: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      ...extra
    },
    { _id: true }
  );

const workerSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' },
    currentOccupation: String,
    currentSalary: String,
    startDate: Date,
    accommodation: String,
    insurance: String,
    status: {
      type: String,
      enum: ['Active', 'Transferred', 'Special Pass', 'Repatriated', 'Terminated', 'Absconded', 'Completed'],
      default: 'Active'
    },
    notes: String,

    salaryHistory: [historyEntry({ amount: String })],
    occupationHistory: [historyEntry({ occupation: String })],
    employmentHistory: [historyEntry({ employer: String, startDate: Date, endDate: Date })],
    transferHistory: [historyEntry({ fromCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' }, toCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' } })],
    statusHistory: [historyEntry({ status: String })],
    specialPassHistory: [historyEntry({ passNumber: String, validFrom: Date, validTo: Date })],
    cancellationHistory: [historyEntry({ cancellationDate: Date, cancellationReason: String })],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

workerSchema.index({ code: 'text' });

module.exports = mongoose.model('Worker', workerSchema);
