const express = require('express');
const Application = require('../models/Application');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

router.get('/', requirePermission('applications', 'view'), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.currentStatus = status;
    if (search) query.code = new RegExp(search, 'i');

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    const [items, total] = await Promise.all([
      Application.find(query)
        .populate('candidate jobDemand company recruiter agent')
        .sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
      Application.countDocuments(query)
    ]);
    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load applications.', error: err.message });
  }
});

router.get('/:id', requirePermission('applications', 'view'), async (req, res) => {
  const item = await Application.findById(req.params.id).populate('candidate jobDemand company recruiter agent statusHistory.changedBy');
  if (!item) return res.status(404).json({ message: 'Application not found.' });
  res.json(item);
});

router.post('/', requirePermission('applications', 'create'), async (req, res) => {
  try {
    const code = await generateCode('APP');
    const item = await Application.create({
      ...req.body,
      code,
      createdBy: req.user.id,
      statusHistory: [{ status: req.body.currentStatus || 'Draft', changedBy: req.user.id, remarks: 'Application created' }]
    });
    await logAction({ req, action: 'CREATE', module: 'Application', relatedRecord: item._id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create application.', error: err.message });
  }
});

router.put('/:id', requirePermission('applications', 'edit'), async (req, res) => {
  try {
    const item = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Application not found.' });
    await logAction({ req, action: 'UPDATE', module: 'Application', relatedRecord: item._id, newValue: req.body });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update application.', error: err.message });
  }
});

// Dedicated status-transition endpoint: always appends to history, never silently overwrites
router.patch('/:id/status', requirePermission('applications', 'edit'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!Application.STATUS_FLOW.includes(status)) {
      return res.status(400).json({ message: `Unknown status: ${status}` });
    }
    const item = await Application.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Application not found.' });

    const oldStatus = item.currentStatus;
    item.currentStatus = status;
    item.statusHistory.push({ status, changedBy: req.user.id, remarks });
    await item.save();

    await logAction({
      req, action: 'UPDATE', module: 'Application', relatedRecord: item._id,
      oldValue: { status: oldStatus }, newValue: { status }, notes: remarks
    });

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update status.', error: err.message });
  }
});

router.delete('/:id', requirePermission('applications', 'delete'), async (req, res) => {
  const item = await Application.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Application not found.' });
  await logAction({ req, action: 'DELETE', module: 'Application', relatedRecord: item._id });
  res.json({ message: 'Application deleted.' });
});

module.exports = router;
