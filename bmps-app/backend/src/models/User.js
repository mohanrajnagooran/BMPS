const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MODULES = [
  'dashboard', 'tasks', 'notifications', 'clients', 'clientCompanies',
  'contacts', 'jobDemands', 'recruitmentJobs', 'applications', 'candidates',
  'interviews', 'medical', 'workPasses', 'deployments', 'workers', 'cases',
  'agents', 'documents', 'emailCenter', 'reports', 'settings'
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'viewConfidential'];

const userSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin', 'Management', 'Recruitment', 'Processing', 'Accounts', 'Staff', 'ReadOnly'],
      default: 'Staff'
    },
    department: {
      type: String,
      enum: ['Management', 'Recruitment', 'Processing', 'Accounts', 'Compliance', 'Operations', 'Admin'],
      default: 'Operations'
    },
    // Per-user permission overrides layered on top of role defaults: { moduleName: [actions] }
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['Active', 'Inactive', 'Suspended', 'Pending'], default: 'Active' },
    lastLogin: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    notes: String
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Default permission matrix per role (super admin gets everything).
// Fine-grained per-user overrides can extend/restrict this via `permissions`.
userSchema.statics.MODULES = MODULES;
userSchema.statics.ACTIONS = ACTIONS;

module.exports = mongoose.model('User', userSchema);
