import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  Users,
  Building2,
  Contact,
  Briefcase,
  ClipboardList,
  FileCheck2,
  UserSearch,
  CalendarClock,
  Stethoscope,
  BadgeCheck,
  Plane,
  HardHat,
  Gavel,
  Handshake,
  FolderLock,
  Mail,
  BarChart3,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { getSession, hasPermission, moduleFromPath, type Module } from "@/lib/auth";

type NavItem = { title: string; url: string; icon: LucideIcon; module: Module };

const overview: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, module: "dashboard" },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, module: "tasks" },
  { title: "Notifications", url: "/notifications", icon: Bell, module: "notifications" },
];

const crm: NavItem[] = [
  { title: "Clients", url: "/clients", icon: Users, module: "clients" },
  { title: "Client Companies", url: "/companies", icon: Building2, module: "companies" },
  { title: "Contacts Directory", url: "/contacts", icon: Contact, module: "contacts" },
];

const recruitment: NavItem[] = [
  { title: "Job Demand", url: "/job-demands", icon: Briefcase, module: "job-demands" },
  { title: "Recruitment / Jobs", url: "/jobs", icon: ClipboardList, module: "jobs" },
  { title: "Applications", url: "/applications", icon: FileCheck2, module: "applications" },
  { title: "Candidates", url: "/candidates", icon: UserSearch, module: "candidates" },
];

const processing: NavItem[] = [
  { title: "Interview", url: "/interview", icon: CalendarClock, module: "interview" },
  { title: "Medical", url: "/medical", icon: Stethoscope, module: "medical" },
  { title: "IPA & Work Pass", url: "/work-pass", icon: BadgeCheck, module: "work-pass" },
  { title: "Deployment", url: "/deployment", icon: Plane, module: "deployment" },
];

const workforce: NavItem[] = [
  { title: "Worker Management", url: "/workers", icon: HardHat, module: "workers" },
  { title: "Case Management", url: "/cases", icon: Gavel, module: "cases" },
  { title: "Agents & Sub-Agents", url: "/agents", icon: Handshake, module: "agents" },
];

const admin: NavItem[] = [
  { title: "Document Management", url: "/documents", icon: FolderLock, module: "documents" },
  { title: "Email Center", url: "/email", icon: Mail, module: "email" },
  { title: "Reports", url: "/reports", icon: BarChart3, module: "reports" },
  { title: "Team & Settings", url: "/settings", icon: Settings, module: "settings" },
];

function Section({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  if (items.length === 0) return null;
  return (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active =
              item.url === "/"
                ? currentPath === "/"
                : currentPath === item.url || currentPath.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useLocation().pathname;
  const session = getSession();
  const filter = (items: NavItem[]) => items.filter((i) => hasPermission(session, i.module));

  const sections: Array<{ label: string; items: NavItem[] }> = [
    { label: "Overview", items: filter(overview) },
    { label: "CRM", items: filter(crm) },
    { label: "Recruitment", items: filter(recruitment) },
    { label: "Processing", items: filter(processing) },
    { label: "Workforce", items: filter(workforce) },
    { label: "Admin", items: filter(admin) },
  ];

  // Silence unused-var warnings for moduleFromPath in future extensions.
  void moduleFromPath;

  return (
    <Sidebar collapsible="icon" className="border-r-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            B
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">BMPS</p>
              <p className="truncate text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                Workforce Mgmt
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {sections.map((s) => (
          <Section key={s.label} label={s.label} items={s.items} currentPath={currentPath} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
