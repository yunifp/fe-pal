import React from "react";
import { Badge } from "@/components/ui/badge";

interface BadgeStatusKelulusanProps {
  value?: string | null;
  className?: string;
}

export const BadgeStatusKelulusan: React.FC<BadgeStatusKelulusanProps> = ({
  value,
  className,
}) => {
  let label = "-";
  let colorClass = "bg-gray-100 text-gray-800";

  switch (value) {
    case "Y":
      label = "Lulus";
      colorClass = "bg-green-100 text-green-800";
      break;
    case "N":
      label = "Tidak Lulus";
      colorClass = "bg-red-100 text-red-800";
      break;
    case null:
    case undefined:
      label = "-";
      colorClass = "bg-gray-100 text-gray-800";
      break;
  }

  return (
    <Badge
      className={`${colorClass} px-2 py-0.5 rounded-full text-sm ${
        className ?? ""
      }`}
    >
      {label}
    </Badge>
  );
};
