import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RelatedRecordField } from "@/components/related-record-field";
import api from "@/lib/api";

const TASK_TYPES = ["Follow-up", "Document Collection", "Call", "Meeting", "Compliance", "Processing", "Internal", "Other"];
const RELATED_MODULES = ["General", "Client", "ClientCompany", "JobDemand", "Candidate", "Application", "Worker", "Case", "Agent"];
const PRIORITIES = ["Low", "Normal", "High", "Urgent"];
const STATUSES = ["Pending", "In Progress", "Completed", "Overdue", "Cancelled"];

export function TaskFormDialog({
  open, onOpenChange, task, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: any | null;
  onSaved: () => void;
}) {
  const isEdit = Boolean(task?._id);
  const [users, setUsers] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    api.get("/users/directory").then(({ data }) => setUsers(data.items)).catch(() => {});
    setValues({
      title: task?.title || "",
      type: task?.type || "Other",
      relatedModule: task?.relatedModule || "General",
      relatedRecord: task?.relatedRecord || "",
      relatedRecordLabel: task?.relatedRecordLabel || "",
      assignedTo: task?.assignedTo?._id || task?.assignedTo || "",
      priority: task?.priority || "Normal",
      startDate: task?.startDate ? task.startDate.slice(0, 10) : "",
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      status: task?.status || "Pending",
      notes: task?.notes || "",
    });
    setError("");
  }, [open, task]);

  function set(name: string, v: any) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...values };
      if (payload.relatedModule === "General") {
        payload.relatedRecord = null;
        payload.relatedRecordLabel = "";
      }
      if (isEdit) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Task title <span className="text-destructive">*</span></Label>
            <Input id="title" required value={values.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Task type</Label>
              <Select value={values.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={values.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Related module</Label>
            <Select value={values.relatedModule} onValueChange={(v) => { set("relatedModule", v); set("relatedRecord", ""); set("relatedRecordLabel", ""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{RELATED_MODULES.map((m) => <SelectItem key={m} value={m}>{m === "ClientCompany" ? "Client Companies" : m === "JobDemand" ? "Job Demand" : m}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {values.relatedModule !== "General" && (
            <div className="space-y-1.5">
              <Label>Related record</Label>
              <RelatedRecordField
                relatedModule={values.relatedModule}
                value={values.relatedRecord}
                onChange={(id, label) => { set("relatedRecord", id); set("relatedRecordLabel", label); }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Assigned to</Label>
            <Select value={values.assignedTo} onValueChange={(v) => set("assignedTo", v)}>
              <SelectTrigger><SelectValue placeholder="Select a team member…" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => <SelectItem key={u._id} value={u._id}>{u.name} &middot; {u.department}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" value={values.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : isEdit ? "Save changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
