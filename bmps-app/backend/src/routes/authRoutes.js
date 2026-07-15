const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role, email: user.email, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });

    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ message: 'Account temporarily locked due to failed attempts. Try again later.' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'This account is not active. Contact your administrator.' });
    }

    const ok = await user.checkPassword(password);
    if (!ok) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      await logAction({ req: { ...req, user: { id: user._id, name: user.name } }, action: 'LOGIN_FAILED', module: 'Auth', relatedRecord: user._id });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    await logAction({ req: { ...req, user: { id: user._id, name: user.name } }, action: 'LOGIN', module: 'Auth', relatedRecord: user._id });

    res.json({
      token,
      user: { id: user._id, code: user.code, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
});

// User management (Settings/Team Control module) - Admin only
router.get('/users', auth, requirePermission('settings', 'view'), async (req, res) => {
  const users = await User.find().select('-passwordHash').sort('-createdAt');
  res.json({ items: users, total: users.length });
});

router.post('/users', auth, requirePermission('settings', 'create'), async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    const existing = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'A user with this email already exists.' });

    const user = new User({ name, email: email.toLowerCase().trim(), role, department, phone });
    user.code = await generateCode('USR');
    await user.setPassword(password || 'Welcome@123');
    await user.save();

    await logAction({ req, action: 'CREATE', module: 'User', relatedRecord: user._id, newValue: { name, email, role } });
    res.status(201).json({ id: user._id, code: user.code, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create user.', error: err.message });
  }
});

router.put('/users/:id', auth, requirePermission('settings', 'edit'), async (req, res) => {
  try {
    const { name, role, department, phone, status, permissions, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (status !== undefined) user.status = status;
    if (permissions !== undefined) user.permissions = permissions;
    if (password) await user.setPassword(password);

    await user.save();
    await logAction({ req, action: 'UPDATE', module: 'User', relatedRecord: user._id, newValue: req.body });
    res.json({ message: 'User updated.' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update user.', error: err.message });
  }
});

router.put('/me/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const ok = await user.checkPassword(currentPassword);
  if (!ok) return res.status(400).json({ message: 'Current password is incorrect.' });
  await user.setPassword(newPassword);
  await user.save();
  res.json({ message: 'Password updated.' });
});

module.exports = router;
