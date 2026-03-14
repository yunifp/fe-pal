import React from "react";
import { type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
  iconBg?: string; // background icon
  iconColor?: string; // warna icon
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  Icon,
  iconBg = "bg-green-100",
  iconColor = "text-primary",
}) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Icon */}
      <div
        className={`p-3 rounded-md flex items-center justify-center ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>

      {/* Title & Subtitle */}
      <div>
        <h3 className="text-md font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
