import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useAuth } from "@/context/AuthContext";
import { canAccessPath, ROLE_LABELS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

function Forbidden() {
  const { session } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role
          {session ? ` (${ROLE_LABELS[session.role]})` : ""} doesn't have permission to view this
          module. Contact your administrator to request access.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>Go to dashboard</Button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!session) navigate("/login", { replace: true });
  }, [session, navigate]);

  if (!session) return null;

  const allowed = canAccessPath(session, location.pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1">{allowed ? <Outlet /> : <Forbidden />}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
