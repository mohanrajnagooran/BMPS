const AuditLog = require('../models/AuditLog');

/**
 * Fire-and-forget audit log writer. Every module calls this on
 * create/update/delete/sensitive-view instead of implementing its own logging.
 */
async function logAction({ req, action, module, relatedRecord, oldValue, newValue, notes }) {
  try {
    await AuditLog.create({
      user: req.user?.id,
      userName: req.user?.name,
      action,
      module,
      relatedRecord,
      oldValue,
      newValue,
      ip: req.ip,
      notes
    });
  } catch (err) {
    // Auditing must never break the main request
    console.error('[audit] failed to write log', err.message);
  }
}

module.exports = { logAction };
