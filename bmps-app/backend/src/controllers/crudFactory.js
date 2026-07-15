const { generateCode } = require('../utils/codeGenerator');
const { logAction } = require('../utils/auditLogger');

/**
 * Builds a full REST controller (list/get/create/update/remove) for a Mongoose model.
 * Every "standard" module (Clients, Agents, Job Demands, Candidates, Tasks, Cases...)
 * is wired through this factory instead of hand-writing repetitive CRUD 13 times.
 *
 * options:
 *  - codePrefix: string used for auto-generated `code` field (e.g. 'CLI')
 *  - searchFields: fields included in the text-ish search (falls back to $text if indexed)
 *  - populate: array of fields to populate on list/get
 *  - moduleName: string used in audit log entries
 */
function createCrudController(Model, options = {}) {
  const { codePrefix, searchFields = [], populate = [], moduleName } = options;

  return {
    async list(req, res) {
      try {
        const { search, status, page = 1, limit = 20, sort = '-createdAt', ...filters } = req.query;
        const query = {};

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') query[key] = value;
        });
        if (status) query.status = status;

        if (search) {
          const regex = new RegExp(search, 'i');
          const orFields = searchFields.length ? searchFields : ['code', 'name'];
          query.$or = orFields.map((f) => ({ [f]: regex }));
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

        let q = Model.find(query).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum);
        populate.forEach((p) => { q = q.populate(p); });

        const [items, total] = await Promise.all([q.exec(), Model.countDocuments(query)]);

        res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
      } catch (err) {
        res.status(500).json({ message: 'Failed to load records.', error: err.message });
      }
    },

    async getOne(req, res) {
      try {
        let q = Model.findById(req.params.id);
        populate.forEach((p) => { q = q.populate(p); });
        const item = await q.exec();
        if (!item) return res.status(404).json({ message: 'Record not found.' });
        res.json(item);
      } catch (err) {
        res.status(500).json({ message: 'Failed to load record.', error: err.message });
      }
    },

    async create(req, res) {
      try {
        const data = { ...req.body, createdBy: req.user?.id };
        if (codePrefix) data.code = await generateCode(codePrefix);
        const item = await Model.create(data);
        await logAction({ req, action: 'CREATE', module: moduleName, relatedRecord: item._id, newValue: data });
        res.status(201).json(item);
      } catch (err) {
        res.status(400).json({ message: 'Failed to create record.', error: err.message });
      }
    },

    async update(req, res) {
      try {
        const before = await Model.findById(req.params.id);
        if (!before) return res.status(404).json({ message: 'Record not found.' });

        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        await logAction({
          req, action: 'UPDATE', module: moduleName, relatedRecord: item._id,
          oldValue: before.toObject(), newValue: req.body
        });
        res.json(item);
      } catch (err) {
        res.status(400).json({ message: 'Failed to update record.', error: err.message });
      }
    },

    async remove(req, res) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Record not found.' });
        await logAction({ req, action: 'DELETE', module: moduleName, relatedRecord: item._id, oldValue: item.toObject() });
        res.json({ message: 'Record deleted.' });
      } catch (err) {
        res.status(500).json({ message: 'Failed to delete record.', error: err.message });
      }
    }
  };
}

module.exports = { createCrudController };
