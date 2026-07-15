import { useMemo, useState, type ReactNode } from "react";
import { ListToolbar } from "@/components/list-toolbar";

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  accessor?: (row: T) => string | number;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys,
  onRowClick,
  onCreate,
  createLabel,
  empty,
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  onCreate?: () => void;
  createLabel?: string;
  empty?: ReactNode;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) => {
      if (searchKeys) {
        return searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
      }
      return Object.values(row as Record<string, unknown>).some((v) =>
        String(v ?? "").toLowerCase().includes(q),
      );
    });
  }, [data, query, searchKeys]);

  return (
    <div className="space-y-4">
      <ListToolbar query={query} onQueryChange={setQuery} onCreate={onCreate} createLabel={createLabel} />
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 text-left font-medium ${c.className ?? ""}`}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {empty ?? "No records found."}
                  </td>
                </tr>
              )}
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-t border-border/60 transition-colors ${onRowClick ? "cursor-pointer hover:bg-muted/40" : ""}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ""}`}>
                      {c.render ? c.render(row) : c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {data.length} records</span>
          <div className="flex items-center gap-1">
            <button className="rounded border border-border px-2 py-1 hover:bg-muted">Prev</button>
            <button className="rounded border border-border px-2 py-1 hover:bg-muted">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
