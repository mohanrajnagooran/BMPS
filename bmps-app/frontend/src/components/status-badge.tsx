import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground/90 border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
};

const mapping: Record<string, keyof typeof tones> = {
  // generic
  Active: "success",
  Inactive: "muted",
  Prospect: "info",
  Draft: "muted",
  Open: "info",
  Closed: "muted",
  Complete: "success",
  Completed: "success",
  Fulfilled: "success",
  Pending: "warning",
  Overdue: "destructive",
  "In Progress": "info",
  Urgent: "destructive",
  High: "destructive",
  Medium: "warning",
  Low: "muted",
  Submitted: "info",
  "Under Review": "warning",
  "IPA Approved": "success",
  "IPA Rejected": "destructive",
  Withdrawn: "muted",
  "Renewal Pending": "warning",
  "Transfer Pending": "warning",
  Cancelled: "muted",
  Repatriated: "muted",
  Absconded: "destructive",
  "Ticket Booked": "info",
  Departed: "info",
  "SG Arrival": "primary",
  "Joining Pending": "warning",
  Issued: "success",
  Renewed: "success",
  Expired: "destructive",
  Sourcing: "info",
  Interviewing: "warning",
  "Ready for Submission": "primary",
  New: "info",
  Shortlisted: "warning",
  Interviewed: "info",
  Selected: "success",
  Rejected: "destructive",
  "Pending MOM": "warning",
  "Pending Client": "warning",
  "Pending Worker": "warning",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = mapping[value] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}
