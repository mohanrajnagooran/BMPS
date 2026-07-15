const express = require('express');
const Contact = require('../models/Contact');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

router.get('/', requirePermission('contacts', 'view'), async (req, res) => {
  try {
    const {
      search, status, contactType, client, company, roleRelationship,
      page = 1, limit = 100, sort = '-createdAt'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (contactType) query.contactType = contactType;
    if (client) query.client = client;
    if (company) query.company = company;
    if (roleRelationship) query.roleRelationship = new RegExp(roleRelationship, 'i');
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ code: regex }, { name: regex }, { idNumber: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 100, 200);

    const [items, total] = await Promise.all([
      Contact.find(query).populate('client', 'name').populate('company', 'name')
        .sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum),
      Contact.countDocuments(query)
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load contacts.', error: err.message });
  }
});

router.get('/:id', requirePermission('contacts', 'view'), async (req, res) => {
  const item = await Contact.findById(req.params.id).populate('client', 'name').populate('company', 'name');
  if (!item) return res.status(404).json({ message: 'Contact not found.' });
  res.json(item);
});

router.post('/', requirePermission('contacts', 'create'), async (req, res) => {
  try {
    const code = await generateCode('CON');
    const item = await Contact.create({ ...req.body, code, createdBy: req.user.id });
    await logAction({ req, action: 'CREATE', module: 'Contact', relatedRecord: item._id, newValue: req.body });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create contact.', error: err.message });
  }
});

router.put('/:id', requirePermission('contacts', 'edit'), async (req, res) => {
  try {
    const before = await Contact.findById(req.params.id);
    if (!before) return res.status(404).json({ message: 'Contact not found.' });
    const item = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('client', 'name').populate('company', 'name');
    await logAction({ req, action: 'UPDATE', module: 'Contact', relatedRecord: item._id, oldValue: before.toObject(), newValue: req.body });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update contact.', error: err.message });
  }
});

router.delete('/:id', requirePermission('contacts', 'delete'), async (req, res) => {
  const item = await Contact.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Contact not found.' });
  await logAction({ req, action: 'DELETE', module: 'Contact', relatedRecord: item._id });
  res.json({ message: 'Contact deleted.' });
});

module.exports = router;
