import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-500 hover:bg-blue-600" },
  in_progress: {
    label: "In Progress",
    className: "bg-yellow-500 hover:bg-yellow-600",
  },
  closed: { label: "Closed", className: "bg-gray-500 hover:bg-gray-600" },
};

interface BadgeStatusTiketProps {
  value: string;
}

const BadgeStatusTiket = ({ value }: BadgeStatusTiketProps) => {
  const config = statusConfig[value] || {
    label: value,
    className: "bg-gray-300",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
};

export default BadgeStatusTiket;
