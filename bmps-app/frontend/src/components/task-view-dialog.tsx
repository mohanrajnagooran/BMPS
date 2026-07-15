import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Edit, Trash2 } from "lucide-react";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

export function TaskViewDialog({
  open, onOpenChange, task, onEdit, onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: any | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!task) return null;
  const fmt = (d?: string) => (d ? format(new Date(d), "dd MMM yyyy") : "—");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-sm text-primary">{task.code}</span>
            <StatusBadge value={task.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Task title</p>
            <p className="mt-1 text-base font-semibold">{task.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Task type" value={task.type} />
            <Field label="Priority" value={<StatusBadge value={task.priority} />} />
            <Field label="Related module" value={task.relatedModule} />
            <Field label="Related record" value={task.relatedRecordLabel || "—"} />
            <Field label="Assigned to" value={task.assignedTo?.name || "Unassigned"} />
            <Field label="Start date" value={fmt(task.startDate)} />
            <Field label="Due date" value={fmt(task.dueDate)} />
            <Field label="Completed date" value={fmt(task.completedDate)} />
          </div>

          {task.notes && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{task.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="justify-between pt-2 sm:justify-between">
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
