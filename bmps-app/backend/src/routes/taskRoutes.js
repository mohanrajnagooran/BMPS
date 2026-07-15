const express = require('express');
const Task = require('../models/Task');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

router.get('/', requirePermission('tasks', 'view'), async (req, res) => {
  try {
    const {
      search, status, priority, relatedModule, assignedTo,
      dueFrom, dueTo, page = 1, limit = 50, sort = '-createdAt'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (relatedModule) query.relatedModule = relatedModule;
    if (assignedTo) query.assignedTo = assignedTo;
    if (dueFrom || dueTo) {
      query.dueDate = {};
      if (dueFrom) query.dueDate.$gte = new Date(dueFrom);
      if (dueTo) query.dueDate.$lte = new Date(dueTo);
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ code: regex }, { title: regex }, { relatedRecordLabel: regex }, { notes: regex }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 50, 200);

    const [items, total] = await Promise.all([
      Task.find(query).populate('assignedTo', 'name role')
        .sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum),
      Task.countDocuments(query)
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tasks.', error: err.message });
  }
});

router.get('/:id', requirePermission('tasks', 'view'), async (req, res) => {
  const item = await Task.findById(req.params.id).populate('assignedTo', 'name role').populate('createdBy', 'name');
  if (!item) return res.status(404).json({ message: 'Task not found.' });
  res.json(item);
});

router.post('/', requirePermission('tasks', 'create'), async (req, res) => {
  try {
    const code = await generateCode('TSK');
    const item = await Task.create({ ...req.body, code, createdBy: req.user.id });
    await logAction({ req, action: 'CREATE', module: 'Task', relatedRecord: item._id, newValue: req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create task.', error: err.message });
  }
});

router.put('/:id', requirePermission('tasks', 'edit'), async (req, res) => {
  try {
    const before = await Task.findById(req.params.id);
    if (!before) return res.status(404).json({ message: 'Task not found.' });

    const body = { ...req.body };
    // Auto-stamp completedDate when a task is marked Completed, clear it otherwise
    if (body.status === 'Completed' && before.status !== 'Completed') {
      body.completedDate = new Date();
    } else if (body.status && body.status !== 'Completed') {
      body.completedDate = null;
    }

    const item = await Task.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).populate('assignedTo', 'name role');
    await logAction({ req, action: 'UPDATE', module: 'Task', relatedRecord: item._id, oldValue: before.toObject(), newValue: body });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update task.', error: err.message });
  }
});

router.delete('/:id', requirePermission('tasks', 'delete'), async (req, res) => {
  const item = await Task.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Task not found.' });
  await logAction({ req, action: 'DELETE', module: 'Task', relatedRecord: item._id });
  res.json({ message: 'Task deleted.' });
});

module.exports = router;
