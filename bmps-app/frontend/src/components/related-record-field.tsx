import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MODULE_LOOKUP: Record<string, { endpoint: string; labelField: string }> = {
  Client: { endpoint: "/clients", labelField: "name" },
  ClientCompany: { endpoint: "/client-companies", labelField: "name" },
  JobDemand: { endpoint: "/job-demands", labelField: "position" },
  Candidate: { endpoint: "/candidates", labelField: "fullName" },
  Application: { endpoint: "/applications", labelField: "code" },
  Worker: { endpoint: "/workers", labelField: "code" },
  Case: { endpoint: "/cases", labelField: "title" },
  Agent: { endpoint: "/agents", labelField: "name" },
};

export function RelatedRecordField({
  relatedModule, value, onChange,
}: {
  relatedModule: string;
  value?: string;
  onChange: (id: string, label: string) => void;
}) {
  const config = MODULE_LOOKUP[relatedModule];
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    if (!config) { setOptions([]); return; }
    api.get(config.endpoint, { params: { limit: 100 } }).then(({ data }) => setOptions(data.items || [])).catch(() => {});
  }, [relatedModule]);

  if (!config) {
    return <p className="text-xs text-muted-foreground">No related record needed for "General" tasks.</p>;
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={(id) => {
        const opt = options.find((o) => o._id === id);
        onChange(id, opt ? (opt[config.labelField] || opt.code) : "");
      }}
    >
      <SelectTrigger><SelectValue placeholder={`Select ${relatedModule}…`} /></SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt._id} value={opt._id}>{opt[config.labelField] || opt.code}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
