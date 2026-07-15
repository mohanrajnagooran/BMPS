const mongoose = require('mongoose');

// One counter document per code prefix (e.g. CLI, APP, WRK ...)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // prefix, e.g. "CLI"
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
