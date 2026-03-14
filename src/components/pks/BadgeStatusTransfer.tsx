import { type FC } from "react";

export interface BadgeStatusTransferProps {
  status: "Y" | "N" | null | undefined;
  className?: string;
}

const LABELS: Record<"Y" | "N", string> = {
  Y: "Sudah Transfer",
  N: "Belum Transfer",
};

const COLORS: Record<"Y" | "N", string> = {
  Y: "bg-blue-50 text-blue-700 border-blue-200",
  N: "bg-gray-50 text-gray-700 border-gray-300",
};

export const BadgeStatusTransfer: FC<BadgeStatusTransferProps> = ({
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
      <span className="w-1 h-1 rounded-full bg-current"></span>
      {LABELS[status]}
    </span>
  );
};
