const express = require('express');
const Worker = require('../models/Worker');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

const HISTORY_FIELDS = [
  'salaryHistory', 'occupationHistory', 'employmentHistory',
  'transferHistory', 'statusHistory', 'specialPassHistory', 'cancellationHistory'
];

router.get('/', requirePermission('workers', 'view'), async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.code = new RegExp(search, 'i');

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

  const [items, total] = await Promise.all([
    Worker.find(query).populate('candidate company application')
      .sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
    Worker.countDocuments(query)
  ]);
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

router.get('/:id', requirePermission('workers', 'view'), async (req, res) => {
  const item = await Worker.findById(req.params.id).populate('candidate company application');
  if (!item) return res.status(404).json({ message: 'Worker not found.' });
  res.json(item);
});

router.post('/', requirePermission('workers', 'create'), async (req, res) => {
  try {
    const code = await generateCode('WRK');
    const item = await Worker.create({ ...req.body, code, createdBy: req.user.id });
    await logAction({ req, action: 'CREATE', module: 'Worker', relatedRecord: item._id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create worker record.', error: err.message });
  }
});

router.put('/:id', requirePermission('workers', 'edit'), async (req, res) => {
  try {
    // Guard: history arrays must never be overwritten wholesale through the general update route
    const body = { ...req.body };
    HISTORY_FIELDS.forEach((f) => delete body[f]);

    const item = await Worker.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Worker not found.' });
    await logAction({ req, action: 'UPDATE', module: 'Worker', relatedRecord: item._id, newValue: body });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update worker.', error: err.message });
  }
});

// Append-only history entry creation, e.g. POST /workers/:id/history/salaryHistory
router.post('/:id/history/:field', requirePermission('workers', 'edit'), async (req, res) => {
  const { field } = req.params;
  if (!HISTORY_FIELDS.includes(field)) {
    return res.status(400).json({ message: `Unknown history field: ${field}` });
  }
  const item = await Worker.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Worker not found.' });

  const entry = { ...req.body, changedBy: req.user.id };
  item[field].push(entry);
  await item.save();

  await logAction({ req, action: 'UPDATE', module: 'Worker', relatedRecord: item._id, newValue: { [field]: entry } });
  res.status(201).json(item);
});

router.delete('/:id', requirePermission('workers', 'delete'), async (req, res) => {
  const item = await Worker.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Worker not found.' });
  await logAction({ req, action: 'DELETE', module: 'Worker', relatedRecord: item._id });
  res.json({ message: 'Worker record deleted.' });
});

module.exports = router;
