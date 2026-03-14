import { Badge } from "@/components/ui/badge";

const priorityConfig: Record<string, { label: string; className: string }> = {
  normal: { label: "Normal", className: "bg-green-500 hover:bg-green-600" },
  tinggi: { label: "Tinggi", className: "bg-orange-500 hover:bg-orange-600" },
  mendesak: { label: "Mendesak", className: "bg-red-500 hover:bg-red-600" },
};

interface BadgePriorityTiketProps {
  value: string;
}

const BadgePriorityTiket = ({ value }: BadgePriorityTiketProps) => {
  const config = priorityConfig[value] || {
    label: value,
    className: "bg-gray-300",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
};

export default BadgePriorityTiket;
