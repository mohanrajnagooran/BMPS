const Counter = require('../models/Counter');

/**
 * Generates a sequential, zero-padded code for any module, e.g. CLI-0001, APP-0027.
 * Uses an atomic findOneAndUpdate so it's safe under concurrent requests.
 * Code format (prefix + padding) is intentionally centralized here so it can be
 * made configurable from Settings later without touching every module.
 */
async function generateCode(prefix, padding = 4) {
  const counter = await Counter.findOneAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(counter.seq).padStart(padding, '0');
  return `${prefix}-${num}`;
}

module.exports = { generateCode };
