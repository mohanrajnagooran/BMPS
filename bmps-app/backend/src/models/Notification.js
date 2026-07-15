const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    type: { type: String, enum: ['Expiry', 'Task Due', 'Case Overdue', 'Status Change', 'System', 'Other'], default: 'Other' },
    category: { type: String, enum: ['Info', 'Warning', 'Urgent'], default: 'Info' },
    relatedModule: String,
    relatedRecord: { type: mongoose.Schema.Types.ObjectId },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Read', 'Dismissed'], default: 'Unread' },
    triggerDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
