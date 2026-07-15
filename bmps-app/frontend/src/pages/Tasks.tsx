import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleListHeader } from "@/components/module-list-header";
import { StatusBadge } from "@/components/status-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskViewDialog } from "@/components/task-view-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import api from "@/lib/api";

const STATUSES = ["Pending", "In Progress", "Completed", "Overdue", "Cancelled"];
const PRIORITIES = ["Low", "Normal", "High", "Urgent"];
const RELATED_MODULES = ["General", "Client", "ClientCompany", "JobDemand", "Candidate", "Application", "Worker", "Case", "Agent"];
const TASK_FIELD_COUNT = 12; // code, title, type, relatedModule, relatedRecord, assignedTo, priority, startDate, dueDate, completedDate, status, notes

export default function TasksList() {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [relatedModule, setRelatedModule] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/tasks", {
      params: {
        search, status, priority, relatedModule,
        dueFrom: dueFrom || undefined, dueTo: dueTo || undefined,
        limit: 100,
      },
    }).then(({ data }) => { setRows(data.items); setTotal(data.total); }).finally(() => setLoading(false));
  }, [search, status, priority, relatedModule, dueFrom, dueTo]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setActiveTask(null); setFormOpen(true); }
  async function openView(task: any) {
    const { data } = await api.get(`/tasks/${task._id}`);
    setActiveTask(data);
    setViewOpen(true);
  }
  function openEditFromRow(task: any) { setActiveTask(task); setFormOpen(true); }
  function openEditFromView() { setViewOpen(false); setFormOpen(true); }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${activeTask._id}`);
      setConfirmOpen(false);
      setViewOpen(false);
      load();
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    const header = ["Code", "Title", "Type", "Related Module", "Related Record", "Assigned To", "Priority", "Due Date", "Status"];
    const lines = rows.map((r) => [
      r.code, r.title, r.type, r.relatedModule, r.relatedRecordLabel || "",
      r.assignedTo?.name || "", r.priority, r.dueDate ? format(new Date(r.dueDate), "yyyy-MM-dd") : "", r.status,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tasks-export.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
      <ModuleListHeader
        title="Tasks"
        description="Manual operational work assigned to users."
        stats={[
          { label: "Current List", value: total },
          { label: "Fields", value: TASK_FIELD_COUNT },
          { label: "Status Options", value: STATUSES.length },
        ]}
        filters={["Date Range", "Related Module", "Assigned To", "Priority", "Due Date", "Status"]}
      />

      <div className="card-elevated space-y-3 p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search code, title, or any field"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setSearch(searchInput); }}
            />
          </div>
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="lg:w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setSearch(searchInput)}>Search</Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={priority || "all"} onValueChange={(v) => setPriority(v === "all" ? "" : v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All priorities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={relatedModule || "all"} onValueChange={(v) => setRelatedModule(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All related modules" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All related modules</SelectItem>
              {RELATED_MODULES.map((m) => <SelectItem key={m} value={m}>{m === "ClientCompany" ? "Client Companies" : m === "JobDemand" ? "Job Demand" : m}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-xs text-muted-foreground">Due:</span>
            <Input type="date" className="w-36" value={dueFrom} onChange={(e) => setDueFrom(e.target.value)} />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" className="w-36" value={dueTo} onChange={(e) => setDueTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tasks</th>
                <th className="px-4 py-3 text-left font-medium">Task Title</th>
                <th className="px-4 py-3 text-left font-medium">Task Type</th>
                <th className="px-4 py-3 text-left font-medium">Related Module</th>
                <th className="px-4 py-3 text-left font-medium">Related Record</th>
                <th className="px-4 py-3 text-left font-medium">Assigned To</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Due Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">Loading tasks…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">No tasks found.</td></tr>
              ) : rows.map((t) => (
                <tr key={t._id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3 align-top">
                    <button className="font-mono text-xs text-primary hover:underline" onClick={() => openView(t)}>{t.code}</button>
                  </td>
                  <td className="px-4 py-3 align-top">{t.title}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{t.type}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {t.relatedModule === "ClientCompany" ? "Client Companies" : t.relatedModule === "JobDemand" ? "Job Demand" : t.relatedModule === "General" ? "—" : t.relatedModule}
                  </td>
                  <td className="px-4 py-3 align-top">{t.relatedRecordLabel || "—"}</td>
                  <td className="px-4 py-3 align-top">{t.assignedTo?.name || "Unassigned"}</td>
                  <td className="px-4 py-3 align-top"><StatusBadge value={t.priority} /></td>
                  <td className="px-4 py-3 align-top tabular-nums">{t.dueDate ? format(new Date(t.dueDate), "yyyy-MM-dd") : "—"}</td>
                  <td className="px-4 py-3 align-top"><StatusBadge value={t.status} /></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => openView(t)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => openEditFromRow(t)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {rows.length} of {total} tasks</span>
        </div>
      </div>

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={activeTask} onSaved={load} />
      <TaskViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        task={activeTask}
        onEdit={openEditFromView}
        onDelete={() => setConfirmOpen(true)}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this task?"
        description={`This will permanently delete ${activeTask?.code || "this task"} — "${activeTask?.title || ""}". This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
