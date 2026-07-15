const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// List documents linked to a specific record: GET /documents?linkedModule=Worker&linkedRecord=<id>
router.get('/', requirePermission('documents', 'view'), async (req, res) => {
  const { linkedModule, linkedRecord } = req.query;
  const query = {};
  if (linkedModule) query.linkedModule = linkedModule;
  if (linkedRecord) query.linkedRecord = linkedRecord;
  const items = await Document.find(query).populate('uploadedBy', 'name').sort('-createdAt');
  res.json({ items, total: items.length });
});

router.post('/upload', requirePermission('documents', 'create'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file was uploaded.' });
    const { type, linkedModule, linkedRecord, issueDate, expiryDate, expiryReminderRequired, confidential, name } = req.body;

    const code = await generateCode('DOC');
    const doc = await Document.create({
      code,
      type: type || 'General',
      name: name || req.file.originalname,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      format: path.extname(req.file.originalname).replace('.', ''),
      linkedModule,
      linkedRecord,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      expiryReminderRequired: expiryReminderRequired === 'true' || expiryReminderRequired === true,
      confidential: confidential === 'true' || confidential === true,
      uploadedBy: req.user.id
    });

    await logAction({ req, action: 'CREATE', module: 'Document', relatedRecord: doc._id, newValue: { name: doc.name, linkedModule, linkedRecord } });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: 'Failed to upload document.', error: err.message });
  }
});

router.delete('/:id', requirePermission('documents', 'delete'), async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Document not found.' });
  const filePath = path.join(uploadDir, path.basename(doc.filePath || ''));
  fs.unlink(filePath, () => {}); // best-effort cleanup
  await logAction({ req, action: 'DELETE', module: 'Document', relatedRecord: doc._id });
  res.json({ message: 'Document deleted.' });
});

module.exports = router;
