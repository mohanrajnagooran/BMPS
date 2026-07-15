const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    referenceSource: String,
    name: { type: String, required: true },
    idNumber: String, // NRIC / FIN / Passport
    type: { type: String, enum: ['Individual', 'Company Representative', 'Other'], default: 'Individual' },
    country: String,
    email: String,
    phone: String,
    phone2: String,
    address: String,
    status: { type: String, enum: ['Active', 'Inactive', 'Pending', 'Blacklisted'], default: 'Active' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', code: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Client', clientSchema);
