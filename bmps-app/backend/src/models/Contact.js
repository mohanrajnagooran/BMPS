const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    contactType: {
      type: String,
      enum: ['Client', 'Candidate', 'Company Contact Person', 'Agent', 'Worker', 'Other'],
      default: 'Other'
    },
    idNumber: String, // NRIC / FIN / Passport number
    phone: String,
    email: String,
    address: String,
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' },
    roleRelationship: String, // e.g. "HR Manager", "Director", "Next of Kin"
    status: { type: String, enum: ['Active', 'Inactive', 'Pending', 'Blacklisted'], default: 'Active' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

contactSchema.index({ code: 'text', name: 'text', idNumber: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
