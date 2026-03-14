const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | null | undefined;
}) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && (
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-800 break-all">
        {value ?? <span className="italic text-slate-400">—</span>}
      </p>
    </div>
  </div>
);

export default InfoRow;
