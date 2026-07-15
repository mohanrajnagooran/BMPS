import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export function ModulePlaceholder({
  title, description, icon: Icon, features,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
      <PageHeader title={title} description={description} />
      <div className="card-elevated p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold">Coming soon</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          This module is on the roadmap and isn't wired up yet. Here's what it will cover:
        </p>
        <ul className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-2 text-left sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
