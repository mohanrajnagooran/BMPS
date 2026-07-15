import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordDialog } from "@/components/record-dialog";
import { StatusBadge } from "@/components/status-badge";
import api from "@/lib/api";
import type { FieldConfig } from "@/lib/types";

const fields: FieldConfig[] = [
  { name: "method", label: "Access method", type: "select", options: ["Scan Only", "ID & Password", "Both", "Not Provided"] },
  { name: "nricFin", label: "NRIC / FIN" },
  { name: "userId", label: "User ID" },
  { name: "password", label: "Password (leave blank to keep unchanged)" },
  { name: "accessNotes", label: "Access notes", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Not Working", "Password Changed", "Recovery Needed", "Suspended", "Closed"] },
];

export function CorpPassPanel({ companyId }: { companyId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    api.get("/corppass-access", { params: { company: companyId } })
      .then(({ data }) => setRecords(data.items))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [companyId]);

  async function handleSave(values: Record<string, any>) {
    setSubmitting(true);
    setError("");
    try {
      if (active?._id) {
        await api.put(`/corppass-access/${active._id}`, values);
      } else {
        await api.post("/corppass-access", { ...values, company: companyId });
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save CorpPass access record.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleReveal(id: string) {
    if (revealed[id]) {
      setRevealed((r) => { const next = { ...r }; delete next[id]; return next; });
      return;
    }
    const { data } = await api.get(`/corppass-access/${id}/reveal`);
    setRevealed((r) => ({ ...r, [id]: data.password || "(no password stored)" }));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Access credentials — password reveal is permission-checked and logged</p>
        <Button size="sm" onClick={() => { setActive(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add access record
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : records.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No CorpPass access recorded for this company yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {records.map((r) => (
            <li key={r._id} className="rounded-md border border-border bg-muted/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" /> {r.method}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    User ID: {r.userId || "—"} &middot; NRIC/FIN: {r.nricFin || "—"}
                  </p>
                  {revealed[r._id] && (
                    <p className="mt-1.5 rounded bg-background px-2 py-1 font-mono text-xs">{revealed[r._id]}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={r.status} />
                  <Button variant="outline" size="sm" onClick={() => toggleReveal(r._id)}>
                    {revealed[r._id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setActive(r); setDialogOpen(true); }}>Edit</Button>
                </div>
              </div>
              {r.accessNotes && <p className="mt-2 text-xs text-muted-foreground">{r.accessNotes}</p>}
            </li>
          ))}
        </ul>
      )}

      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={active ? "Edit CorpPass Access" : "Add CorpPass Access"}
        fields={fields}
        record={active}
        onSubmit={handleSave}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
