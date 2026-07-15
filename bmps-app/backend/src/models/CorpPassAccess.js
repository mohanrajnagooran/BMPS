const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const corpPassAccessSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientCompany', required: true },
    method: { type: String, enum: ['Scan Only', 'ID & Password', 'Both', 'Not Provided'], default: 'Not Provided' },
    nricFin: String,
    userId: String,
    userIdSameAsNricFin: { type: Boolean, default: false },
    passwordEncrypted: String, // stored encrypted, never returned raw by default
    accessNotes: String,
    status: { type: String, enum: ['Active', 'Not Working', 'Password Changed', 'Recovery Needed', 'Suspended', 'Closed'], default: 'Active' },
    lastUpdatedDate: Date
  },
  { timestamps: true }
);

// Helper (not a schema method exposed to JSON) used by the controller
// to set/reveal the password explicitly and deliberately.
corpPassAccessSchema.methods.setPassword = function (plain) {
  this.passwordEncrypted = plain ? encrypt(plain) : undefined;
};
corpPassAccessSchema.methods.revealPassword = function () {
  return this.passwordEncrypted ? decrypt(this.passwordEncrypted) : null;
};

// Never leak the encrypted password blob in normal API responses.
corpPassAccessSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordEncrypted;
    return ret;
  }
});

module.exports = mongoose.model('CorpPassAccess', corpPassAccessSchema);
