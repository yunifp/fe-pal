// ─────────────────────────────────────────────────────────────────────────────
// StatBadge
// ─────────────────────────────────────────────────────────────────────────────

interface StatBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

export function StatBadge({ icon, label, value, color }: StatBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 ${color}`}>
      <div className="opacity-70">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground leading-none mb-1">
          {label}
        </p>
        <p className="text-sm font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
