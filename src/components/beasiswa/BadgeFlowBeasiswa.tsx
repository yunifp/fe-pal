import { type FC } from "react";

export interface BadgeFlowBeasiswaProps {
  id: number | string | null | undefined;
  className?: string;
  labels?: Partial<Record<number, string>>;
  colorClasses?: Partial<Record<number, string>>;
}

const DEFAULT_LABELS: Record<number, string> = {
  1: "Draft",
  2: "Verifikasi",
  3: "Tolak",
  4: "Perlu Perbaikan",
  5: "Verifikasi Hasil Perbaikan",
  6: "Proses Analisa dan Penelaahan",
  7: "Proses Wawancara & Akademik",
  8: "Proses Verifikasi Dinas",
  9: "Perlu Perbaikan",
  10: "Verifikasi Hasil Perbaikan",
  11: "Proses Analisa Rasio",
  12: "Proses BPDP",
  14: "Proses Verifikasi Dinas Provinsi",
  17: "Lulus Administrasi",
};

const DEFAULT_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-700 border-gray-300",
  2: "bg-blue-50 text-blue-700 border-blue-200",
  3: "bg-red-50 text-red-700 border-red-200",
  4: "bg-amber-50 text-amber-700 border-amber-200",
  5: "bg-indigo-50 text-indigo-700 border-indigo-200",
  6: "bg-orange-50 text-orange-700 border-orange-200",
  7: "bg-teal-50 text-teal-700 border-teal-200",
  8: "bg-cyan-50 text-cyan-700 border-cyan-200",
  9: "bg-amber-50 text-amber-700 border-amber-200",
  10: "bg-indigo-50 text-indigo-700 border-indigo-200",
  11: "bg-pink-50 text-pink-700 border-pink-200",
  12: "bg-green-50 text-green-700 border-green-200",
  14: "bg-blue-50 text-blue-700 border-blue-200",
  17: "bg-green-50 text-green-700 border-green-200",
};

const ADMIN_LULUS = [6, 7, 9, 10, 11, 12];

export const BadgeFlowBeasiswa: FC<BadgeFlowBeasiswaProps> = ({
  id,
  className = "",
  labels,
  colorClasses,
}) => {
  let idNum = Number(id);

  if (ADMIN_LULUS.includes(idNum)) {
    idNum = 17;
  }

  const label = (labels && labels[idNum]) || DEFAULT_LABELS[idNum] || "Unknown";

  const colorClass =
    (colorClasses && colorClasses[idNum]) ||
    DEFAULT_COLORS[idNum] ||
    "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}>
      <span className="w-1 h-1 rounded-full bg-current"></span>
      {label}
    </span>
  );
};

export default BadgeFlowBeasiswa;
