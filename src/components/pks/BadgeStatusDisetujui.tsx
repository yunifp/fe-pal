import { type FC } from "react";

export interface BadgeStatusDisetujuiProps {
  status:
    | "Dalam Proses Kampus"
    | "Dalam Proses BPDP"
    | "Dalam Proses Pencairan"
    | "Selesai"
    | null
    | undefined;
  className?: string;
}

const COLORS: Record<
  | "Dalam Proses Kampus"
  | "Dalam Proses BPDP"
  | "Dalam Proses Pencairan"
  | "Selesai",
  string
> = {
  "Dalam Proses Kampus": "bg-blue-50 text-blue-700 border-blue-200",
  "Dalam Proses BPDP": "bg-purple-50 text-purple-700 border-purple-200",
  "Dalam Proses Pencairan": "bg-amber-50 text-amber-700 border-amber-200",
  Selesai: "bg-green-50 text-green-700 border-green-200",
};

export const BadgeStatusDisetujui: FC<BadgeStatusDisetujuiProps> = ({
  status,
  className = "",
}) => {
  if (!status) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
        -
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${COLORS[status]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};
