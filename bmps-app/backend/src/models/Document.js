const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    type: { type: String, default: 'General' }, // e.g. Passport, Contract, Medical Report...
    name: { type: String, required: true },
    fileName: String,
    filePath: String,
    fileSize: Number,
    format: String,
    linkedModule: { type: String, required: true }, // e.g. 'Client', 'Worker', 'Application'
    linkedRecord: { type: mongoose.Schema.Types.ObjectId, required: true },
    issueDate: Date,
    expiryDate: Date,
    expiryReminderRequired: { type: Boolean, default: false },
    confidential: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['Active', 'Expired', 'Superseded', 'Archived'], default: 'Active' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

documentSchema.index({ linkedModule: 1, linkedRecord: 1 });

module.exports = mongoose.model('Document', documentSchema);
