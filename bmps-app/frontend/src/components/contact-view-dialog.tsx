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

export function ContactViewDialog({
  open, onOpenChange, contact, onEdit, onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact: any | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-sm text-primary">{contact.code}</span>
            <StatusBadge value={contact.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Contact name</p>
            <p className="mt-1 text-base font-semibold">{contact.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact type" value={contact.contactType} />
            <Field label="Role / Relationship" value={contact.roleRelationship || "—"} />
            <Field label="NRIC / FIN / Passport" value={contact.idNumber || "—"} />
            <Field label="Phone number" value={contact.phone || "—"} />
            <Field label="Email" value={contact.email || "—"} />
            <Field label="Address" value={contact.address || "—"} />
            <Field label="Linked client" value={contact.client?.name || "—"} />
            <Field label="Linked company" value={contact.company?.name || "—"} />
          </div>

          {contact.notes && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{contact.notes}</p>
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
