import { type FC } from "react";

export interface BadgeSubFlowLembagaPendidikanProps {
  subFlow: string | null | undefined;
  className?: string;
}

export const BadgeSubFlowLembagaPendidikan: FC<
  BadgeSubFlowLembagaPendidikanProps
> = ({ subFlow, className = "" }) => {
  let label = "-";
  let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

  const map: Record<string, string> = {
    "Staff Divisi Beasiswa": "bg-blue-50 text-blue-700 border-blue-200",

    "Verifikator PJK": "bg-purple-50 text-purple-700 border-purple-200",

    Batching: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",

    "TTD Pimpinan": "bg-teal-50 text-teal-700 border-teal-200",
  };

  if (subFlow && map[subFlow]) {
    label = subFlow;
    colorClass = map[subFlow];
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}
    >
      {subFlow && <span className="w-1 h-1 rounded-full bg-current" />}
      {label}
    </span>
  );
};
