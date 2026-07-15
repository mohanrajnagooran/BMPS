// Session + RBAC helpers. Session is populated by a real login call to the
// Express API (see context/AuthContext.tsx); this file just manages storage
// and the client-side permission map used to filter navigation.

export type Role =
  | "SuperAdmin" | "Admin" | "Management" | "Recruitment"
  | "Processing" | "Accounts" | "Staff" | "ReadOnly";

export type Session = {
  id: string;
  code: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  token: string;
};

const SESSION_KEY = "bmps_user";
const TOKEN_KEY = "bmps_token";

// Every top-level module the app exposes. Keys match the leading URL segment.
export const MODULES = [
  "dashboard", "tasks", "notifications",
  "clients", "companies", "contacts",
  "job-demands", "jobs", "applications", "candidates",
  "interview", "medical", "work-pass", "deployment",
  "workers", "cases", "agents",
  "documents", "email", "reports", "settings",
] as const;

export type Module = (typeof MODULES)[number];

const ALL: Module[] = [...MODULES];
const BASE: Module[] = ["dashboard", "tasks", "notifications"];

export const ROLE_PERMISSIONS: Record<Role, Module[]> = {
  SuperAdmin: ALL,
  Admin: ALL,
  Management: [...BASE, "clients", "companies", "contacts", "job-demands", "jobs",
    "applications", "candidates", "workers", "cases", "agents", "reports", "settings"],
  Recruitment: [...BASE, "clients", "companies", "contacts", "job-demands", "jobs",
    "applications", "candidates", "interview", "documents"],
  Processing: [...BASE, "candidates", "medical", "work-pass", "deployment",
    "workers", "cases", "documents", "applications"],
  Accounts: [...BASE, "reports", "companies"],
  Staff: [...BASE],
  ReadOnly: [...BASE, "clients", "companies", "contacts", "job-demands",
    "applications", "candidates", "workers", "reports"],
};

export const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin: "Super Administrator",
  Admin: "Administrator",
  Management: "Management",
  Recruitment: "Recruitment Officer",
  Processing: "Processing Officer",
  Accounts: "Accounts",
  Staff: "Staff",
  ReadOnly: "Viewer (Read-only)",
};

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !token) return null;
    return { ...JSON.parse(raw), token };
  } catch {
    return null;
  }
}

export function saveSession(user: Omit<Session, "token">, token: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function moduleFromPath(pathname: string): Module {
  if (pathname === "/" || pathname === "") return "dashboard";
  const seg = pathname.replace(/^\/+/, "").split("/")[0];
  return (MODULES as readonly string[]).includes(seg) ? (seg as Module) : "dashboard";
}

export function hasPermission(session: Session | null, mod: Module): boolean {
  if (!session) return false;
  return ROLE_PERMISSIONS[session.role]?.includes(mod) ?? false;
}

export function canAccessPath(session: Session | null, pathname: string): boolean {
  return hasPermission(session, moduleFromPath(pathname));
}
