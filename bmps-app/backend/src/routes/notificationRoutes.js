const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(auth);

router.get('/', requirePermission('notifications', 'view'), async (req, res) => {
  const { status } = req.query;
  const query = { recipient: req.user.id };
  if (status) query.status = status;
  const items = await Notification.find(query).sort('-createdAt').limit(100);
  const unreadCount = await Notification.countDocuments({ recipient: req.user.id, status: 'Unread' });
  res.json({ items, total: items.length, unreadCount });
});

router.patch('/:id/read', requirePermission('notifications', 'view'), async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { status: 'Read' },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Notification not found.' });
  res.json(item);
});

router.patch('/mark-all-read', requirePermission('notifications', 'view'), async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, status: 'Unread' }, { status: 'Read' });
  res.json({ message: 'All notifications marked as read.' });
});

module.exports = router;
