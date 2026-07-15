import { useEffect, useState, useCallback } from "react";
import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleListHeader } from "@/components/module-list-header";
import { StatusBadge } from "@/components/status-badge";
import { LookupSelect } from "@/components/lookup-select";
import { ContactFormDialog } from "@/components/contact-form-dialog";
import { ContactViewDialog } from "@/components/contact-view-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import api from "@/lib/api";

const STATUSES = ["Active", "Inactive", "Pending", "Blacklisted"];
const CONTACT_TYPES = ["Client", "Candidate", "Company Contact Person", "Agent", "Worker", "Other"];
const CONTACT_FIELD_COUNT = 13; // code, name, contactType, idNumber, phone, email, address, client, company, roleRelationship, status, notes, createdBy

export default function Contacts() {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [contactType, setContactType] = useState("");
  const [client, setClient] = useState("");
  const [company, setCompany] = useState("");
  const [roleRelationship, setRoleRelationship] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/contacts", {
      params: { search, status, contactType, client, company, roleRelationship, limit: 100 },
    }).then(({ data }) => { setRows(data.items); setTotal(data.total); }).finally(() => setLoading(false));
  }, [search, status, contactType, client, company, roleRelationship]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setActiveContact(null); setFormOpen(true); }
  async function openView(contact: any) {
    const { data } = await api.get(`/contacts/${contact._id}`);
    setActiveContact(data);
    setViewOpen(true);
  }
  function openEditFromRow(contact: any) { setActiveContact(contact); setFormOpen(true); }
  function openEditFromView() { setViewOpen(false); setFormOpen(true); }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/contacts/${activeContact._id}`);
      setConfirmOpen(false);
      setViewOpen(false);
      load();
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    const header = ["Code", "Name", "Contact Type", "NRIC/FIN/Passport", "Phone", "Email", "Linked Client", "Linked Company", "Status"];
    const lines = rows.map((r) => [
      r.code, r.name, r.contactType, r.idNumber || "", r.phone || "", r.email || "",
      r.client?.name || "", r.company?.name || "", r.status,
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts-export.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
      <ModuleListHeader
        title="Global Contacts Directory"
        description="Central searchable directory for all people and contact records in the system."
        stats={[
          { label: "Current List", value: total },
          { label: "Fields", value: CONTACT_FIELD_COUNT },
          { label: "Status Options", value: STATUSES.length },
        ]}
        filters={["Contact Type", "Client", "Client Company", "Role / Relationship", "Status"]}
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
            <Plus className="mr-2 h-4 w-4" /> New Record
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={contactType || "all"} onValueChange={(v) => setContactType(v === "all" ? "" : v)}>
            <SelectTrigger className="w-52"><SelectValue placeholder="All contact types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contact types</SelectItem>
              {CONTACT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="w-52">
            <LookupSelect endpoint="/clients" labelField="name" value={client} onChange={setClient} placeholder="All clients" clearable clearLabel="All clients" />
          </div>
          <div className="w-56">
            <LookupSelect endpoint="/client-companies" labelField="name" value={company} onChange={setCompany} placeholder="All client companies" clearable clearLabel="All client companies" />
          </div>
          <Input
            className="w-52"
            placeholder="Role / Relationship"
            value={roleRelationship}
            onChange={(e) => setRoleRelationship(e.target.value)}
          />
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Global Contacts Directory</th>
                <th className="px-4 py-3 text-left font-medium">Contact Name</th>
                <th className="px-4 py-3 text-left font-medium">Contact Type</th>
                <th className="px-4 py-3 text-left font-medium">NRIC / FIN / Passport Number</th>
                <th className="px-4 py-3 text-left font-medium">Phone Number</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Linked Client Name</th>
                <th className="px-4 py-3 text-left font-medium">Linked Company Name</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">Loading contacts…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">No contacts found.</td></tr>
              ) : rows.map((c) => (
                <tr key={c._id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-4 py-3 align-top">
                    <button className="font-mono text-xs text-primary hover:underline" onClick={() => openView(c)}>{c.code}</button>
                  </td>
                  <td className="px-4 py-3 align-top font-medium">{c.name}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{c.contactType}</td>
                  <td className="px-4 py-3 align-top font-mono text-xs">{c.idNumber || "—"}</td>
                  <td className="px-4 py-3 align-top">{c.phone || "—"}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{c.email || "—"}</td>
                  <td className="px-4 py-3 align-top">{c.client?.name || "—"}</td>
                  <td className="px-4 py-3 align-top">{c.company?.name || "—"}</td>
                  <td className="px-4 py-3 align-top"><StatusBadge value={c.status} /></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => openView(c)}>View</Button>
                      <Button variant="outline" size="sm" onClick={() => openEditFromRow(c)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {rows.length} of {total} contacts</span>
        </div>
      </div>

      <ContactFormDialog open={formOpen} onOpenChange={setFormOpen} contact={activeContact} onSaved={load} />
      <ContactViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        contact={activeContact}
        onEdit={openEditFromView}
        onDelete={() => setConfirmOpen(true)}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this contact?"
        description={`This will permanently delete ${activeContact?.code || "this contact"} — "${activeContact?.name || ""}". This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
