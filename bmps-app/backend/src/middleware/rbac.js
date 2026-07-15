const { isAllowed } = require('../config/roleDefaults');

/**
 * Usage: router.get('/', requirePermission('clients', 'view'), handler)
 * Keeps permission checks declarative at the route level, one line per route,
 * instead of repeating if-checks inside every controller.
 */
function requirePermission(moduleName, action) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    if (!isAllowed(req.user, moduleName, action)) {
      return res.status(403).json({
        message: `You don't have permission to ${action} ${moduleName}.`
      });
    }
    next();
  };
}

module.exports = { requirePermission };
