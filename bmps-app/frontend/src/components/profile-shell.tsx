import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";

export function ProfileShell({
  backTo, backLabel, title, subtitle, status, metaFields, tabs, actions,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  status?: string;
  metaFields: { label: string; value: ReactNode }[];
  tabs: { value: string; label: string; content: ReactNode }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to={backTo}><ArrowLeft className="mr-1.5 h-4 w-4" />{backLabel}</Link>
      </Button>

      <div className="card-elevated p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {status && <StatusBadge value={status} />}
            </div>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 md:grid-cols-4">
          {metaFields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Tabs defaultValue={tabs[0]?.value}>
        <TabsList className="bg-muted/50">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            {t.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function ProfilePanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function TimelineList({ items }: { items: { id: string; when: string; who: string; what: string }[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {items.map((i) => (
        <li key={i.id} className="relative">
          <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
          <p className="text-xs text-muted-foreground">{i.when} · {i.who}</p>
          <p className="text-sm">{i.what}</p>
        </li>
      ))}
    </ol>
  );
}
