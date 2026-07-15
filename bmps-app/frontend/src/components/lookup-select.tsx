import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LookupSelect({
  endpoint, labelField, value, onChange, placeholder, clearable, clearLabel,
}: {
  endpoint: string;
  labelField: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  clearable?: boolean;
  clearLabel?: string;
}) {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    api.get(endpoint, { params: { limit: 100 } }).then(({ data }) => setOptions(data.items || [])).catch(() => {});
  }, [endpoint]);

  return (
    <Select
      value={value || (clearable ? "__all__" : undefined)}
      onValueChange={(v) => onChange(v === "__all__" ? "" : v)}
    >
      <SelectTrigger><SelectValue placeholder={placeholder || "Select…"} /></SelectTrigger>
      <SelectContent>
        {clearable && <SelectItem value="__all__">{clearLabel || placeholder || "All"}</SelectItem>}
        {options.map((opt) => (
          <SelectItem key={opt._id} value={opt._id}>{opt[labelField] || opt.code}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
