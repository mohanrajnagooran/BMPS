const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    fullName: { type: String, required: true },
    passportNumber: String,
    passportExpiry: Date,
    nationality: String,
    dob: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: String,
    email: String,
    address: String,
    skills: String,
    experience: String,
    education: String,
    preferredCountry: String,
    preferredSalary: String,
    source: { type: String, enum: ['Agent', 'Walk-in', 'Referral', 'Online', 'Other'], default: 'Agent' },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    medicalHistory: String,
    status: {
      type: String,
      enum: ['New', 'Screening', 'Shortlisted', 'Interviewing', 'Selected', 'Processing', 'Deployed', 'Rejected', 'Withdrawn'],
      default: 'New'
    },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

candidateSchema.index({ fullName: 'text', code: 'text', passportNumber: 'text' });

module.exports = mongoose.model('Candidate', candidateSchema);
