export function ModuleListHeader({
  title, description, stats, filters,
}: {
  title: string;
  description: string;
  stats: { label: string; value: number | string }[];
  filters: string[];
}) {
  return (
    <div className="card-elevated overflow-hidden border-l-4 border-l-primary">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[92px] rounded-lg border border-border bg-muted/30 px-4 py-2 text-center">
              <p className="text-xl font-bold tabular-nums leading-none">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
        <span className="text-xs font-medium text-muted-foreground">Filters:</span>
        {filters.map((f) => (
          <span key={f} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
