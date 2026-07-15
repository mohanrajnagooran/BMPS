import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LookupSelect } from "@/components/lookup-select";
import type { FieldConfig } from "@/lib/types";

export function RecordDialog({
  open, onOpenChange, title, fields, record, onSubmit, submitting, error,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: FieldConfig[];
  record?: Record<string, any> | null;
  onSubmit: (values: Record<string, any>) => void;
  submitting?: boolean;
  error?: string;
}) {
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        const v = record?.[f.name];
        initial[f.name] = v && typeof v === "object" && v._id ? v._id : (v ?? "");
      });
      setValues(initial);
    }
  }, [open, record, fields]);

  function set(name: string, v: any) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>
                {f.label}{f.required && <span className="text-destructive"> *</span>}
              </Label>

              {f.type === "select" ? (
                <Select value={values[f.name] || undefined} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={f.name}><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {f.options!.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : f.type === "lookup" ? (
                <LookupSelect
                  endpoint={f.lookupEndpoint!}
                  labelField={f.lookupLabel!}
                  value={values[f.name]}
                  onChange={(v) => set(f.name, v)}
                />
              ) : f.type === "textarea" ? (
                <Textarea id={f.name} rows={3} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
              ) : (
                <Input
                  id={f.name}
                  type={f.type || "text"}
                  required={f.required}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
