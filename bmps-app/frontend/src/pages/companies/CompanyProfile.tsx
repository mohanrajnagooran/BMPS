import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileShell, ProfilePanel } from "@/components/profile-shell";
import { RecordDialog } from "@/components/record-dialog";
import { DocumentPanel } from "@/components/document-panel";
import { CorpPassPanel } from "@/components/corppass-panel";
import api from "@/lib/api";
import type { FieldConfig } from "@/lib/types";

const fields: FieldConfig[] = [
  { name: "name", label: "Company name", required: true },
  { name: "uen", label: "UEN" },
  { name: "client", label: "Client", type: "lookup", lookupEndpoint: "/clients", lookupLabel: "name", required: true },
  { name: "country", label: "Country" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "sector", label: "Sector", type: "select", options: ["Primary", "Secondary"] },
  { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Pending", "Blacklisted"] },
  { name: "complianceNotes", label: "Compliance notes", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/client-companies/${id}`),
      api.get("/workers", { params: { company: id, limit: 100 } }),
    ]).then(([c, w]) => {
      setCompany(c.data);
      setWorkers(w.data.items);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(values: Record<string, any>) {
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/client-companies/${id}`, values);
      setEditOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update company.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !company) {
    return <div className="p-8 text-sm text-muted-foreground">Loading company…</div>;
  }

  return (
    <>
      <ProfileShell
        backTo="/companies"
        backLabel="Back to Companies"
        title={company.name}
        subtitle={`UEN ${company.uen || "—"} · ${company.sector || "—"}`}
        status={company.status}
        actions={<Button size="sm" onClick={() => setEditOpen(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>}
        metaFields={[
          { label: "Parent Client", value: company.client?.name ? (
            <span className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/clients/${company.client._id}`)}>
              {company.client.name}
            </span>
          ) : "—" },
          { label: "Sector", value: company.sector || "—" },
          { label: "Country", value: company.country || "—" },
          { label: "Active Workers", value: <span className="tabular-nums">{workers.length}</span> },
        ]}
        tabs={[
          {
            value: "workers",
            label: "Workers",
            content: (
              <ProfilePanel title={`${workers.length} Worker Record${workers.length === 1 ? "" : "s"}`}>
                {workers.length === 0 ? (
                  <p className="py-3 text-center text-sm text-muted-foreground">No workers linked to this company yet.</p>
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {workers.map((w) => (
                      <li
                        key={w._id}
                        className="flex cursor-pointer items-center justify-between py-2 first:pt-0 hover:text-primary"
                        onClick={() => navigate(`/workers/${w._id}`)}
                      >
                        <div>
                          <p className="font-medium">{w.candidate?.fullName || w.code}</p>
                          <p className="text-xs text-muted-foreground">{w.code} &middot; {w.currentOccupation || "—"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{w.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </ProfilePanel>
            ),
          },
          {
            value: "compliance",
            label: "Compliance",
            content: (
              <ProfilePanel title="Compliance Notes">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {company.complianceNotes || "No compliance notes recorded yet. Use Edit to track ACRA / IRAS / AIS / AGM / Annual Return items."}
                </p>
              </ProfilePanel>
            ),
          },
          {
            value: "corppass",
            label: "CorpPass",
            content: (
              <ProfilePanel title="CorpPass Access">
                <CorpPassPanel companyId={id!} />
              </ProfilePanel>
            ),
          },
          {
            value: "docs",
            label: "Documents",
            content: (
              <ProfilePanel title="Documents">
                <DocumentPanel linkedModule="ClientCompany" linkedRecord={id!} />
              </ProfilePanel>
            ),
          },
        ]}
      />

      <RecordDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={`Edit ${company.name}`}
        fields={fields}
        record={company}
        onSubmit={handleSave}
        submitting={submitting}
        error={error}
      />
    </>
  );
}
