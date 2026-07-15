import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("admin@bmps.local");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/");
  }

  return (
    <div className="fixed inset-0 z-50 grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Left: Brand panel */}
      <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, oklch(0.7 0.18 260 / 0.7), transparent 45%), radial-gradient(circle at 85% 85%, oklch(0.6 0.16 220 / 0.6), transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">BMPS</p>
            <p className="text-xs text-sidebar-foreground/70">Recruitment & Workforce</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            End-to-end workforce operations, in one place.
          </h1>
          <p className="text-sm leading-relaxed text-sidebar-foreground/75">
            Manage clients, job demands, applications, deployment, work passes and cases across
            your entire recruitment lifecycle.
          </p>

          <ul className="space-y-3 pt-2">
            {[
              { icon: Briefcase, label: "Job demand & recruitment pipeline" },
              { icon: Users, label: "Candidates, workers & deployment" },
              { icon: ShieldCheck, label: "Work pass, medical & case tracking" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-sidebar-foreground/85">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-sidebar-accent">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/60">
          &copy; {new Date().getFullYear()} BMPS. All rights reserved.
        </p>
      </aside>

      {/* Right: Form panel */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">BMPS</p>
              <p className="text-xs text-muted-foreground">Recruitment & Workforce</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your BMPS workspace to continue.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/login" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Keep me signed in
              </Label>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : (<>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>)}
            </Button>

            <p className="pt-2 text-center text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
              Seeded admin login: <span className="font-mono">admin@bmps.local</span> / <span className="font-mono">Admin@12345</span>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
