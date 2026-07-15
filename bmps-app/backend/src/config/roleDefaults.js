// Static role -> default allowed actions per module.
// SuperAdmin/Admin: everything. Others: sensible operational defaults.
// This can be moved into a DB-backed Role collection later (Settings module)
// without changing the RBAC middleware's interface.

const ALL = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'viewConfidential'];
const STANDARD = ['view', 'create', 'edit', 'export'];
const VIEW_ONLY = ['view'];

const roleDefaults = {
  SuperAdmin: '*',
  Admin: '*',
  Management: {
    default: ['view', 'export', 'approve'],
    settings: VIEW_ONLY,
    contacts: STANDARD
  },
  Recruitment: {
    default: VIEW_ONLY,
    jobDemands: STANDARD,
    recruitmentJobs: STANDARD,
    candidates: STANDARD,
    interviews: STANDARD,
    tasks: STANDARD,
    agents: STANDARD,
    contacts: STANDARD
  },
  Processing: {
    default: VIEW_ONLY,
    applications: STANDARD,
    medical: STANDARD,
    workPasses: STANDARD,
    deployments: STANDARD,
    workers: STANDARD,
    cases: STANDARD,
    tasks: STANDARD,
    documents: STANDARD
  },
  Accounts: {
    default: VIEW_ONLY,
    reports: STANDARD,
    clientCompanies: VIEW_ONLY
  },
  Staff: {
    default: VIEW_ONLY,
    tasks: STANDARD
  },
  ReadOnly: {
    default: VIEW_ONLY
  }
};

function isAllowed(user, moduleName, action) {
  if (!user) return false;
  const roleMap = roleDefaults[user.role];
  if (roleMap === '*') return true;

  // per-user override takes precedence if present
  const override = user.permissions && user.permissions[moduleName];
  if (Array.isArray(override)) {
    if (override.includes(action)) return true;
  }

  if (!roleMap) return false;
  const moduleActions = roleMap[moduleName] || roleMap.default || [];
  return moduleActions.includes(action);
}

module.exports = { roleDefaults, isAllowed, ALL, STANDARD, VIEW_ONLY };
