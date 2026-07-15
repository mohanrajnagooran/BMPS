const express = require('express');
const { createCrudController } = require('../controllers/crudFactory');
const { requirePermission } = require('../middleware/rbac');

/**
 * Wires standard CRUD routes with permission checks for a given module.
 * moduleKey must match a key used in role permission maps (e.g. 'clients').
 */
function createCrudRouter(Model, { codePrefix, searchFields, populate, moduleName, moduleKey }) {
  const router = express.Router();
  const ctrl = createCrudController(Model, { codePrefix, searchFields, populate, moduleName });

  router.get('/', requirePermission(moduleKey, 'view'), ctrl.list);
  router.get('/:id', requirePermission(moduleKey, 'view'), ctrl.getOne);
  router.post('/', requirePermission(moduleKey, 'create'), ctrl.create);
  router.put('/:id', requirePermission(moduleKey, 'edit'), ctrl.update);
  router.delete('/:id', requirePermission(moduleKey, 'delete'), ctrl.remove);

  return router;
}

module.exports = { createCrudRouter };
