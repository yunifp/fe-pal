import { type FC } from "react";

export interface BadgeFlowProps {
  flow: string | null | undefined;
  className?: string;
}

export const BadgeFlowLembagaPendidikan: FC<BadgeFlowProps> = ({
  flow,
  className = "",
}) => {
  let label = "-";
  let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

  const map: Record<string, string> = {
    "Verifikasi Lembaga Pendidikan":
      "bg-amber-50 text-amber-700 border-amber-200",

    "Revisi Lembaga Pendidikan": "bg-red-50 text-red-700 border-red-200",

    "Hasil Perbaikan Lembaga Pendidikan":
      "bg-indigo-50 text-indigo-700 border-indigo-200",

    "Verifikasi BPDP": "bg-cyan-50 text-cyan-700 border-cyan-200",

    Selesai: "bg-green-50 text-green-700 border-green-200",
  };

  if (flow && map[flow]) {
    label = flow;
    colorClass = map[flow];
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}
    >
      {flow && <span className="w-1 h-1 rounded-full bg-current" />}
      {label}
    </span>
  );
};
