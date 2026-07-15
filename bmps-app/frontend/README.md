# BMPS Frontend — Design Port (v2)

This replaces the earlier custom-styled frontend with your uploaded **Lovable/shadcn design**
("Clean Corporate" navy theme), rebuilt as a plain Vite + React + TypeScript + Tailwind v4 app
(no TanStack Start/Router, no mock data) and wired to the existing Express/MongoDB backend
in `../backend`.

## What's wired so far (module 1 of many)

- **Shell**: Login, sidebar (RBAC-aware nav), topbar, dashboard — all pulling real data from the API.
- **Clients module, fully wired**: list (search, create), profile page (edit, linked Client
  Companies, linked Cases, Documents tab with real upload/download).

This is the **template** for the rest: the same `RecordDialog` (config-driven create/edit form),
`DataTable` + `ListToolbar` (design's own components, untouched), `ProfileShell` + `ProfilePanel`
(design's own components, untouched), and `DocumentPanel` will be reused for every other module —
Client Companies, Agents, Job Demand, Candidates, Applications, Workers, Cases, Tasks,
Notifications, Settings — plus new backend modules for Interview, Medical, Work Pass, Deployment,
Jobs, and Contacts Directory (not yet in the backend; straightforward additions using the existing
`crudFactory` pattern).

## Run it

```bash
# Backend (unchanged)
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev              # http://localhost:5000

# Frontend (this new design)
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Seeded login: **admin@bmps.local / Admin@12345**

## What changed vs. the uploaded design package

- Removed TanStack Start/Router/React Query — routing is now `react-router-dom`, data fetching
  is plain `useEffect` + axios (`src/lib/api.ts`), matching the rest of this codebase.
- `src/lib/auth.ts` — replaced the mock session/localStorage auth with real JWT auth against
  the Express API (`src/context/AuthContext.tsx` does the actual `/api/auth/login` call).
  The role/permission-matrix concept from the design is preserved, remapped to the backend's
  actual roles (SuperAdmin, Admin, Management, Recruitment, Processing, Accounts, Staff, ReadOnly).
- All `components/ui/*` (shadcn primitives) and the shared `page-header`, `stat-card`,
  `status-badge`, `data-table`, `list-toolbar`, `profile-shell` components are copied **unchanged**
  from your design — they had no framework-specific dependencies, so they port directly.
- `mock-data.ts` usage is replaced module-by-module with real API calls as each module gets wired.

## Next steps

Say the word and I'll continue module-by-module through the rest of the sidebar
(Client Companies → Agents → Job Demand → Candidates → Applications → Workers → Cases →
Tasks/Notifications/Settings), and add the missing backend pieces (Interview, Medical,
Work Pass, Deployment, Jobs, Contacts Directory) as I go.
