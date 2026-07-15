import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { RecordDialog } from "@/components/record-dialog";
import api from "@/lib/api";
import type { FieldConfig } from "@/lib/types";

type CompanyRow = {
  id: string;
  code: string;
  name: string;
  uen?: string;
  sector?: string;
  status: string;
  client?: { name?: string };
  [key: string]: any;
};

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

export default function CompaniesList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api.get("/client-companies", { params: { limit: 200, sort: "-createdAt" } })
      .then(({ data }) => setRows(data.items.map((r: any) => ({ ...r, id: r._id }))))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(values: Record<string, any>) {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/client-companies", values);
      setDialogOpen(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create company.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<CompanyRow>[] = [
    { key: "code", header: "Code", className: "font-mono text-xs w-28", render: (r) => <span className="text-primary">{r.code}</span> },
    { key: "name", header: "Company", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "uen", header: "UEN", className: "font-mono text-xs" },
    { key: "client", header: "Client", render: (r) => <span className="text-muted-foreground">{r.client?.name || "—"}</span> },
    { key: "sector", header: "Sector" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
      <PageHeader title="Client Companies" description="Registered client company entities with UEN, CorpPass and compliance tracking" />
      <DataTable
        data={rows}
        columns={columns}
        searchKeys={["name", "code", "uen"]}
        onRowClick={(r) => navigate(`/companies/${r.id}`)}
        createLabel="New Company"
        onCreate={() => setDialogOpen(true)}
        empty={loading ? "Loading companies…" : "No client companies found."}
      />
      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="New Client Company"
        fields={fields}
        onSubmit={handleCreate}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
