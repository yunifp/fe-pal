import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface CountCardProps {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  label: string;
  count: number | string;
}

const CountCard = ({
  icon: Icon,
  bgColor,
  iconColor,
  label,
  count,
}: CountCardProps) => {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3">
        <div
          className={`p-3 rounded-full inline-block`}
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-[#8C8C8C]">{label}</span>
          <span className="text-lg font-bold">{count}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountCard;
