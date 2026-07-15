import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Building2, UsersRound, Briefcase, UserSearch, FileCheck2,
  HardHat, Gavel, AlertTriangle, CheckSquare, Clock, Bell,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  const cards = data?.cards || {};
  const chartData = (data?.applicationsByStatus || []).map((s: any) => ({ status: s._id, count: s.count }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.name?.split(" ")[0] || "there"} — here's what's happening today`}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Clients" value={loading ? "…" : cards.totalClients} icon={Users} tone="default" onClick={() => navigate("/clients")} />
        <StatCard label="Client Companies" value={loading ? "…" : cards.totalCompanies} icon={Building2} tone="default" onClick={() => navigate("/companies")} />
        <StatCard label="Active Agents" value={loading ? "…" : cards.totalAgents} icon={UsersRound} tone="default" onClick={() => navigate("/agents")} />
        <StatCard label="Open Job Demand" value={loading ? "…" : cards.openJobDemands} icon={Briefcase} tone="info" onClick={() => navigate("/job-demands")} />
        <StatCard label="Active Candidates" value={loading ? "…" : cards.activeCandidates} icon={UserSearch} tone="default" onClick={() => navigate("/candidates")} />
        <StatCard label="Applications In Progress" value={loading ? "…" : cards.applicationsInProgress} icon={FileCheck2} tone="info" onClick={() => navigate("/applications")} />
        <StatCard label="Active Workers" value={loading ? "…" : cards.activeWorkers} icon={HardHat} tone="success" onClick={() => navigate("/workers")} />
        <StatCard label="Open Cases" value={loading ? "…" : cards.openCases} icon={Gavel} tone={cards.urgentCases ? "destructive" : "default"} onClick={() => navigate("/cases")} />
        <StatCard label="Urgent Cases" value={loading ? "…" : cards.urgentCases} icon={AlertTriangle} tone="destructive" onClick={() => navigate("/cases")} />
        <StatCard label="My Pending Tasks" value={loading ? "…" : cards.myPendingTasks} icon={CheckSquare} tone="default" onClick={() => navigate("/tasks")} />
        <StatCard label="Overdue Tasks" value={loading ? "…" : cards.overdueTasks} icon={Clock} tone={cards.overdueTasks ? "destructive" : "default"} onClick={() => navigate("/tasks")} />
        <StatCard label="Unread Notifications" value={loading ? "…" : cards.unreadNotifications} icon={Bell} tone="warning" onClick={() => navigate("/notifications")} />
      </div>

      <div className="card-elevated p-5">
        <h3 className="font-display text-base font-semibold tracking-tight">Applications by status</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Live pipeline breakdown from the database</p>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No application data yet. Once applications are created, this chart shows your pipeline at a glance.
          </p>
        ) : (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="status" width={150} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="oklch(0.35 0.12 265)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
