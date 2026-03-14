import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-base text-gray-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-4 bg-white">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
