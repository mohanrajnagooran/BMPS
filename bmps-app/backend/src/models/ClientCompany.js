const mongoose = require('mongoose');

const clientCompanySchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    uen: String,
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    country: String,
    address: String,
    sector: { type: String, enum: ['Primary', 'Secondary'], default: 'Primary' },
    complianceNotes: String,
    status: { type: String, enum: ['Active', 'Inactive', 'Pending', 'Blacklisted'], default: 'Active' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

clientCompanySchema.index({ name: 'text', code: 'text', uen: 'text' });

module.exports = mongoose.model('ClientCompany', clientCompanySchema);
