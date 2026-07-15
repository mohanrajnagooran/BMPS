import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, Edit, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileShell, ProfilePanel } from "@/components/profile-shell";
import { RecordDialog } from "@/components/record-dialog";
import { DocumentPanel } from "@/components/document-panel";
import api from "@/lib/api";
import type { FieldConfig } from "@/lib/types";
import { format } from "date-fns";

const fields: FieldConfig[] = [
  { name: "name", label: "Full name", required: true },
  { name: "type", label: "Type", type: "select", options: ["Individual", "Company Representative", "Other"] },
  { name: "idNumber", label: "ID / NRIC / Passport number" },
  { name: "country", label: "Country" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "phone2", label: "Alternate phone" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "referenceSource", label: "Reference source" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Pending", "Blacklisted"] },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/clients/${id}`),
      api.get("/client-companies", { params: { client: id, limit: 100 } }),
      api.get("/cases", { params: { client: id, limit: 100 } }),
    ]).then(([c, comp, cs]) => {
      setClient(c.data);
      setCompanies(comp.data.items);
      setCases(cs.data.items);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(values: Record<string, any>) {
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/clients/${id}`, values);
      setEditOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update client.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !client) {
    return <div className="p-8 text-sm text-muted-foreground">Loading client…</div>;
  }

  return (
    <>
      <ProfileShell
        backTo="/clients"
        backLabel="Back to Clients"
        title={client.name}
        subtitle={`${client.code} · ${client.country || "—"}`}
        status={client.status}
        actions={
          <>
            <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" />Export</Button>
            <Button size="sm" onClick={() => setEditOpen(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
          </>
        }
        metaFields={[
          { label: "Primary Phone", value: <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{client.phone || "—"}</span> },
          { label: "Email", value: <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{client.email || "—"}</span> },
          { label: "Reference", value: client.referenceSource || "—" },
          { label: "Onboarded", value: client.createdAt ? format(new Date(client.createdAt), "dd MMM yyyy") : "—" },
          { label: "Companies", value: <span className="tabular-nums">{companies.length}</span> },
          { label: "Open Cases", value: <span className="tabular-nums">{cases.length}</span> },
        ]}
        tabs={[
          {
            value: "summary",
            label: "Summary",
            content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ProfilePanel title="Client Companies">
                  {companies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No companies linked yet.</p>
                  ) : (
                    <ul className="divide-y divide-border text-sm">
                      {companies.map((c) => (
                        <li
                          key={c._id}
                          className="flex cursor-pointer items-center justify-between py-2 first:pt-0 hover:text-primary"
                          onClick={() => navigate(`/companies/${c._id}`)}
                        >
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.uen || "No UEN"} · {c.sector}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{c.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </ProfilePanel>
                <ProfilePanel title="Open Cases">
                  {cases.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No cases linked yet.</p>
                  ) : (
                    <ul className="divide-y divide-border text-sm">
                      {cases.map((c) => (
                        <li key={c._id} className="flex items-center justify-between py-2 first:pt-0">
                          <div>
                            <p className="font-medium">{c.title}</p>
                            <p className="text-xs text-muted-foreground">{c.code} · {c.type}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{c.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </ProfilePanel>
              </div>
            ),
          },
          {
            value: "docs",
            label: "Documents",
            content: (
              <ProfilePanel title="Linked Documents">
                <DocumentPanel linkedModule="Client" linkedRecord={id!} />
              </ProfilePanel>
            ),
          },
          {
            value: "notes",
            label: "Notes",
            content: (
              <ProfilePanel title="Internal Notes">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {client.notes || "No notes recorded yet. Use Edit to add internal notes for this client."}
                </p>
              </ProfilePanel>
            ),
          },
        ]}
      />

      <RecordDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={`Edit ${client.name}`}
        fields={fields}
        record={client}
        onSubmit={handleSave}
        submitting={submitting}
        error={error}
      />
    </>
  );
}
