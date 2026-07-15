import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export function DocumentPanel({ linkedModule, linkedRecord }: { linkedModule: string; linkedRecord: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    api.get("/documents", { params: { linkedModule, linkedRecord } })
      .then(({ data }) => setDocs(data.items))
      .finally(() => setLoading(false));
  }

  useEffect(() => { if (linkedRecord) load(); }, [linkedModule, linkedRecord]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("linkedModule", linkedModule);
    fd.append("linkedRecord", linkedRecord);
    fd.append("name", file.name);
    try {
      await api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(docId: string) {
    await api.delete(`/documents/${docId}`);
    load();
  }

  const origin = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Files linked to this record</p>
        <Button variant="outline" size="sm" asChild disabled={uploading}>
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : docs.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          No documents yet. Upload passports, contracts, or other files here.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {docs.map((d) => (
            <li key={d._id} className="flex items-center gap-2.5 rounded-md border border-border bg-muted/30 px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.type} &middot; {format(new Date(d.createdAt), "dd MMM yyyy")}</p>
              </div>
              <a href={`${origin}${d.filePath}`} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                <Download className="h-3.5 w-3.5" />
              </a>
              <button onClick={() => handleDelete(d._id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
