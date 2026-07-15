const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Lightweight lookup list — just enough to populate "Assigned To" style dropdowns.
// Deliberately not gated behind the 'settings' permission (unlike /auth/users),
// since any staff member needs to be able to assign tasks to teammates.
router.get('/directory', async (req, res) => {
  const users = await User.find({ status: 'Active' }).select('name role department').sort('name');
  res.json({ items: users, total: users.length });
});

module.exports = router;
