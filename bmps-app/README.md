# BMPS — Recruitment & Workforce Management CRM

A working MERN-stack starter build of your BMPS system: **React + Tailwind** frontend,
**Node/Express** API, **MongoDB/Mongoose** database. Covers the foundation
(auth, RBAC, audit log, document management) plus 13 functional modules end-to-end:
Clients, Client Companies, Agents & Sub-Agents, Job Demand, Candidates, Applications
& Processing (with status workflow), Worker Management (with history tabs), Case
Management, Tasks, Notifications, and Team Control & Settings (Users).

## 1. What's included

```
bmps-app/
├── backend/     Node/Express API (JWT auth, RBAC, MongoDB models, file uploads)
└── frontend/    React + Tailwind UI (responsive: desktop table / mobile card views)
```

Shared building blocks (see `backend/src/utils` and `backend/src/controllers/crudFactory.js`)
mean most modules are "configuration on top of a shared CRUD engine" rather than
duplicated code — this is what makes 13 modules manageable and makes adding the
remaining ones (Interview, Medical, IPA & Work Pass, Deployment, Global Contacts
Directory, Email Center, Reports) mostly a matter of following the same pattern.

## 2. Run it locally

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

### Backend
```bash
cd backend
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed                 # creates admin user + sample records
npm run dev                   # starts API on http://localhost:5000
```
Seeded login: **admin@bmps.local / Admin@12345**

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # starts UI on http://localhost:5173
```
Open http://localhost:5173 and log in with the seeded admin account.

## 3. What to try first
- Log in, look at the **Dashboard** (live counts pulled from the database).
- Create a **Client** → a **Client Company** under it → a **Job Demand** → a **Candidate**.
- Go to **Applications**, create an application linking the candidate + job demand,
  then use **Advance status** to walk it through the workflow (Draft → Submitted → … → Active Worker),
  and watch the **status timeline** build up automatically.
- Go to **Worker Management**, create a worker record, and add entries under the
  Salary / Occupation / Transfers / Status tabs — these are **append-only histories**,
  matching the spec's "never overwrite, keep history" requirement.
- Open any record and use the **Documents** panel to upload a file — it's stored once
  and linked polymorphically, the same service every module uses.
- Go to **Settings** to create additional staff users with different roles
  (Recruitment, Processing, Accounts, Staff…) — permissions are enforced server-side.

## 4. Extending it — adding a new simple module

Most modules (Clients, Agents, Job Demand, Candidates, Tasks, Cases) follow one pattern:

1. **Backend**: add a Mongoose model in `backend/src/models/`, then one line in
   `backend/src/routes/standardRoutes.js` using `createCrudRouter(...)`.
2. **Frontend**: add one entry to `frontend/src/config/moduleRegistry.js` describing
   its columns and form fields, then one `<Route>` in `App.jsx` using `<ResourcePage config={...} />`.

Richer modules (Applications, Workers) that need custom workflow logic or history
tabs are built as dedicated pages (`Applications.jsx`, `Workers.jsx`) — use those as
the template for Interview, Medical, IPA & Work Pass, and Deployment, which need
similar status/timeline treatment.

## 5. Deploying to a Hostinger VPS

This is the same deployment path from the earlier plan — summarized here:

```bash
# On the VPS (Ubuntu)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm install -g pm2
sudo apt install -y nginx

# Clone and run
git clone <your-repo-url> /var/www/bmps && cd /var/www/bmps
cd backend && npm install --production && cp .env.example .env   # fill in real values
pm2 start server.js --name bmps-api && pm2 save && pm2 startup

cd ../frontend && npm install && npm run build   # outputs to frontend/dist
```

Nginx serves `frontend/dist` as static files and reverse-proxies `/api` and `/uploads`
to the Node process on port 5000 (see the earlier deployment guide for the full config
block, or ask and I can drop an `nginx.conf` file straight into this project).
Use `certbot --nginx` for free HTTPS once your domain points at the VPS.

## 6. Security notes for production
- Change `JWT_SECRET` in `.env` to a long random value before deploying.
- CorpPass and email-account passwords are AES-encrypted at rest (`backend/src/utils/crypto.js`);
  rotate the encryption key derivation to a dedicated `ENCRYPTION_KEY` env var rather than
  reusing `JWT_SECRET`, for real deployments.
- Set up scheduled `mongodump` backups — the spec calls for both automatic and manual backup/restore.
- Restrict MongoDB to localhost-only if self-hosting on the same VPS (don't expose port 27017).
