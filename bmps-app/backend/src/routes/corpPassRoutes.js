const express = require('express');
const CorpPassAccess = require('../models/CorpPassAccess');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

// List CorpPass access records for a company: GET /corppass-access?company=<id>
router.get('/', requirePermission('clientCompanies', 'view'), async (req, res) => {
  const { company } = req.query;
  const query = {};
  if (company) query.company = company;
  const items = await CorpPassAccess.find(query).sort('-createdAt');
  res.json({ items, total: items.length });
});

router.post('/', requirePermission('clientCompanies', 'edit'), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const record = new CorpPassAccess(rest);
    if (password) record.setPassword(password);
    await record.save();
    await logAction({ req, action: 'CREATE', module: 'CorpPassAccess', relatedRecord: record._id, notes: 'CorpPass access record created' });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: 'Failed to save CorpPass access record.', error: err.message });
  }
});

router.put('/:id', requirePermission('clientCompanies', 'edit'), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const record = await CorpPassAccess.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });
    Object.assign(record, rest);
    if (password) record.setPassword(password);
    record.lastUpdatedDate = new Date();
    await record.save();
    await logAction({ req, action: 'UPDATE', module: 'CorpPassAccess', relatedRecord: record._id, notes: 'CorpPass access record updated' });
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update CorpPass access record.', error: err.message });
  }
});

// Deliberately separate, permission + audit-logged endpoint to reveal the password
router.get('/:id/reveal', requirePermission('clientCompanies', 'viewConfidential'), async (req, res) => {
  const record = await CorpPassAccess.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Record not found.' });
  await logAction({ req, action: 'VIEW_SENSITIVE', module: 'CorpPassAccess', relatedRecord: record._id, notes: 'CorpPass password revealed' });
  res.json({ password: record.revealPassword() });
});

router.delete('/:id', requirePermission('clientCompanies', 'delete'), async (req, res) => {
  const record = await CorpPassAccess.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ message: 'Record not found.' });
  await logAction({ req, action: 'DELETE', module: 'CorpPassAccess', relatedRecord: record._id });
  res.json({ message: 'Record deleted.' });
});

module.exports = router;
