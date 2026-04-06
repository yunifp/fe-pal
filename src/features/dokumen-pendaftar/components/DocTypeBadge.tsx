import { FileImage, FileText } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DocTypeBadge
// ─────────────────────────────────────────────────────────────────────────────

interface DocTypeBadgeProps {
  type: "foto" | "umum" | "khusus";
}

const STYLES: Record<DocTypeBadgeProps["type"], string> = {
  foto: "bg-violet-50 text-violet-700 border-violet-200",
  umum: "bg-blue-50   text-blue-700   border-blue-200",
  khusus: "bg-orange-50 text-orange-700 border-orange-200",
};

const LABELS: Record<DocTypeBadgeProps["type"], string> = {
  foto: "Foto",
  umum: "Umum",
  khusus: "Khusus",
};

export function DocTypeBadge({ type }: DocTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STYLES[type]}`}>
      {type === "foto" ? (
        <FileImage className="h-2.5 w-2.5" />
      ) : (
        <FileText className="h-2.5 w-2.5" />
      )}
      {LABELS[type]}
    </span>
  );
}
