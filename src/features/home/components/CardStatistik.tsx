import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface CardStatistikProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
}

const CardStatistik = ({
  icon: Icon,
  title,
  value,
  onClick,
}: CardStatistikProps) => {
  return (
    <Card
      onClick={onClick}
      className="p-0 group cursor-pointer shadow-none transition-colors hover:border-primary/40"
    >
      <CardContent className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-">
          <div className="flex items-center justify-start gap-2">
            {/* Icon */}
            <div className="p-2 rounded-md flex items-center justify-center bg-gray-100 transition-colors group-hover:bg-primary/10">
              <Icon className="w-4 h-4 text-gray-600 transition-colors group-hover:text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-700 transition-colors group-hover:text-primary">
              {title}
            </h3>
          </div>

          {onClick && (
            <div className="p-1 rounded-full border border-gray-200 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
              <ArrowUpRight className="w-4 h-4 text-gray-600 transition-colors group-hover:text-primary" />
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-3xl font-bold text-gray-900 transition-colors group-hover:text-primary">
          {value}
        </p>
      </CardContent>
    </Card>
  );
};

export default CardStatistik;
