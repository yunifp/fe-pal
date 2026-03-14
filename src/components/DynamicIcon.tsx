import * as Icons from "lucide-react";

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name?: string;
  className?: string;
}

const DynamicIcon = ({ name, className, ...props }: DynamicIconProps) => {
  if (!name) return null;
  const LucideIcon = (Icons as any)[name];
  return LucideIcon ? <LucideIcon className={className} {...props} /> : null;
};

export default DynamicIcon;
