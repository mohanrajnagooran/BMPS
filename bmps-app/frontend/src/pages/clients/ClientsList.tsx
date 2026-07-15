import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleListHeader } from "@/components/module-list-header";
import { StatusBadge } from "@/components/status-badge";
import { RecordDialog } from "@/components/record-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import api from "@/lib/api";
import type { FieldConfig } from "@/lib/types";

const STATUSES = ["Active", "Inactive", "Pending", "Blacklisted"];

const fields: FieldConfig[] = [
  { name: "name", label: "Full name", required: true },
  { name: "type", label: "Type", type: "select", options: ["Individual", "Company Representative", "Partner", "Company", "Other"] },
  { name: "idNumber", label: "ID / NRIC / Passport number" },
  { name: "country", label: "Country" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "phone2", label: "Alternate phone" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "referenceSource", label: "Reference source" },
  { name: "status", label: "Status", type: "select", options: STATUSES },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function ClientsList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/clients", { params: { search, status, limit: 200, sort: "-createdAt" } })
      .then(({ data }) => { setRows(data.items); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === "Active").length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    const countries = new Set(rows.map((r) => r.country).filter(Boolean)).size;
    return { total, active, countries, pending };
  }, [rows, total]);

  function openCreate() { setActiveClient(null); setError(""); setFormOpen(true); }
  function openEdit(client: any) { setActiveClient(client); setError(""); setFormOpen(true); }

  async function handleSubmit(values: Record<string, any>) {
    setSubmitting(true);
    setError("");
    try {
      if (activeClient?._id) {
        await api.put(`/clients/${activeClient._id}`, values);
      } else {
        await api.post("/clients", values);
      }
      setFormOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save client.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!activeClient) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${activeClient._id}`);
      setConfirmOpen(false);
      load();
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    const header = ["Code", "Name", "Type", "Country", "Phone", "Email", "Reference Source", "Status"];
    const lines = rows.map((r) => [
      r.code, r.name, r.type, r.country || "", r.phone || "", r.email || "", r.referenceSource || "", r.status,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "clients-export.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
      <ModuleListHeader
        title="Clients"
        description="Maintain every client as the parent record before linking companies, job demand, email accounts, invoices, documents, and operations history."
        stats={[
          { label: "Total Clients", value: stats.total },
          { label: "Active Clients", value: stats.active },
          { label: "Countries", value: stats.countries },
          { label: "Pending Review", value: stats.pending },
        ]}
        filters={["Date Range", "Client", "Client Type", "Country", "Reference Source", "Status"]}
      />

      <div className="card-elevated flex flex-col gap-2 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search client code, name, phone, email, country"
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
          <Plus className="mr-2 h-4 w-4" /> Create Client
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Client</th>
                <th className="px-4 py-3 text-left font-medium">Client Type</th>
                <th className="px-4 py-3 text-left font-medium">Country</th>
                <th className="px-4 py-3 text-left font-medium">Contact</th>
                <th className="px-4 py-3 text-left font-medium">Reference Source</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading clients…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No clients found.</td></tr>
              ) : rows.map((c) => (
                <tr key={c._id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3 align-top">
                    <button className="block font-mono text-xs text-primary hover:underline" onClick={() => navigate(`/clients/${c._id}`)}>{c.code}</button>
                    <span className="font-semibold">{c.name}</span>
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-3 align-top">{c.country || "—"}</td>
                  <td className="px-4 py-3 align-top">
                    {c.phone && <span className="block font-medium">{c.phone}</span>}
                    <span className="text-muted-foreground">{c.email || (c.phone ? "" : "—")}</span>
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{c.referenceSource || "—"}</td>
                  <td className="px-4 py-3 align-top"><StatusBadge value={c.status} /></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${c._id}`)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                      <Button
                        variant="outline" size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => { setActiveClient(c); setConfirmOpen(true); }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {rows.length} of {total} clients</span>
        </div>
      </div>

      <RecordDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={activeClient ? `Edit ${activeClient.name}` : "New Client"}
        fields={fields}
        record={activeClient}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this client?"
        description={`This will permanently delete ${activeClient?.code || "this client"} — "${activeClient?.name || ""}". Linked companies and cases will keep their records but lose this reference. This cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
