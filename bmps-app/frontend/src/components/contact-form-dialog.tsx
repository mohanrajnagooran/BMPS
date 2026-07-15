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
import api from "@/lib/api";

const CONTACT_TYPES = ["Client", "Candidate", "Company Contact Person", "Agent", "Worker", "Other"];
const STATUSES = ["Active", "Inactive", "Pending", "Blacklisted"];

export function ContactFormDialog({
  open, onOpenChange, contact, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact?: any | null;
  onSaved: () => void;
}) {
  const isEdit = Boolean(contact?._id);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setValues({
      name: contact?.name || "",
      contactType: contact?.contactType || "Other",
      idNumber: contact?.idNumber || "",
      phone: contact?.phone || "",
      email: contact?.email || "",
      address: contact?.address || "",
      client: contact?.client?._id || contact?.client || "",
      company: contact?.company?._id || contact?.company || "",
      roleRelationship: contact?.roleRelationship || "",
      status: contact?.status || "Active",
      notes: contact?.notes || "",
    });
    setError("");
  }, [open, contact]);

  function set(name: string, v: any) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/contacts/${contact._id}`, values);
      } else {
        await api.post("/contacts", values);
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save contact.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Contact" : "New Record"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Contact name <span className="text-destructive">*</span></Label>
            <Input id="name" required value={values.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contact type</Label>
              <Select value={values.contactType} onValueChange={(v) => set("contactType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTACT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idNumber">NRIC / FIN / Passport</Label>
              <Input id="idNumber" value={values.idNumber} onChange={(e) => set("idNumber", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={2} value={values.address} onChange={(e) => set("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Linked client</Label>
              <LookupSelect endpoint="/clients" labelField="name" value={values.client} onChange={(v) => set("client", v)} placeholder="None" />
            </div>
            <div className="space-y-1.5">
              <Label>Linked client company</Label>
              <LookupSelect endpoint="/client-companies" labelField="name" value={values.company} onChange={(v) => set("company", v)} placeholder="None" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roleRelationship">Role / Relationship</Label>
            <Input id="roleRelationship" placeholder="e.g. HR Manager, Director, Next of Kin" value={values.roleRelationship} onChange={(e) => set("roleRelationship", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : isEdit ? "Save changes" : "Create Contact"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
