const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    action: {
      type: String,
      enum: [
        'CREATE', 'UPDATE', 'DELETE', 'VIEW_SENSITIVE',
        'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'EXPORT', 'PERMISSION_CHANGE'
      ],
      required: true
    },
    module: { type: String, required: true },
    relatedRecord: { type: mongoose.Schema.Types.ObjectId },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ip: String,
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
