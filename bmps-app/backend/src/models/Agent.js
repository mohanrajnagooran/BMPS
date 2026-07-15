const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Main Agent', 'Sub-Agent', 'Freelance Recruiter', 'Partner Agent', 'Other'], default: 'Sub-Agent' },
    category: { type: String, enum: ['Individual Agent', 'Company Agent'], default: 'Individual Agent' },
    country: String,
    state: String,
    city: String,
    locationCategory: { type: String, enum: ['India-Based', 'Singapore-Based', 'Other Overseas'] },
    dob: Date,
    contactPerson: String,
    email: String,
    phone: String,
    address: String,
    status: { type: String, enum: ['Active', 'Inactive', 'On Hold', 'Blacklisted'], default: 'Active' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

agentSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('Agent', agentSchema);
