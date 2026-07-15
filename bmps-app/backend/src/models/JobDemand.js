const mongoose = require('mongoose');

const jobDemandSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany' },
    country: String,
    position: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    salary: String,
    qualification: String,
    requirements: String,
    benefits: String,
    permitType: { type: String, enum: ['Work Permit', 'S Pass', 'Employment Pass', 'Training Employment Pass', 'Other'] },
    workingHours: String,
    offDays: String,
    accommodation: String,
    food: String,
    contractPeriod: String,
    deadline: Date,
    status: { type: String, enum: ['Draft', 'Open', 'In Progress', 'On Hold', 'Fulfilled', 'Cancelled', 'Closed'], default: 'Draft' },
    assignedRecruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

jobDemandSchema.index({ code: 'text', position: 'text' });

module.exports = mongoose.model('JobDemand', jobDemandSchema);
