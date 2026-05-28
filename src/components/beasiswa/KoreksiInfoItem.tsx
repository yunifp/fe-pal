import { type FC } from "react";
import { ExternalLink, Download } from "lucide-react";

interface KoreksiFieldState {
  field: string;
  label: string;
  catatan: string;
}

interface KoreksiInfoItemProps {
  icon: FC<{ className?: string }>;
  label: string;
  value?: string | null;
  fileUrl?: string | null;
  fileLabel?: string;
  onDownload?: (url: string) => void;
  showKoreksi?: boolean;
  fieldKey?: string;
  koreksiFields?: KoreksiFieldState[];
  onToggle?: (field: string, label: string) => void;
  onCatatanChange?: (field: string, catatan: string) => void;
}

const KoreksiInfoItem: FC<KoreksiInfoItemProps> = ({
  icon: Icon,
  label,
  value,
  fileUrl,
  fileLabel = "Lihat File",
  onDownload,
  showKoreksi = false,
  fieldKey,
  koreksiFields = [],
  onToggle,
  onCatatanChange,
}) => {
  const isChecked = !!koreksiFields.find((k) => k.field === fieldKey);
  const current = koreksiFields.find((k) => k.field === fieldKey);

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {/* Label row */}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {/* Value + file link + koreksi checkbox dalam satu baris */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p
            className={`text-sm break-words ${
              isChecked && showKoreksi ? "text-amber-600 font-medium" : ""
            }`}>
            {value || "-"}
          </p>

          {fileUrl && (
            <button
              type="button"
              onClick={(e) => {
                if (onDownload) {
                  e.preventDefault();
                  onDownload(fileUrl);
                } else {
                  window.open(fileUrl, "_blank", "noopener,noreferrer");
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-primary border border-primary/40 rounded-md px-2 py-0.5 hover:bg-primary/10 transition-colors flex-shrink-0 cursor-pointer">
              {onDownload ? (
                <Download className="w-3 h-3" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
              {fileLabel}
            </button>
          )}

          {/* ✅ Checkbox koreksi inline di samping value — tidak menambah baris baru */}
          {showKoreksi && fieldKey && (
            <label className="inline-flex items-center gap-1 cursor-pointer ml-auto flex-shrink-0">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle?.(fieldKey, label)}
                className="h-3.5 w-3.5 rounded border-gray-300 accent-amber-500"
              />
              <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                Koreksi
              </span>
            </label>
          )}
        </div>

        {/* ✅ Input catatan — hanya muncul jika di-check, tidak mengganggu grid neighbor */}
        {showKoreksi && isChecked && fieldKey && (
          <input
            type="text"
            placeholder={`Catatan untuk ${label}...`}
            value={current?.catatan ?? ""}
            onChange={(e) => onCatatanChange?.(fieldKey, e.target.value)}
            className="mt-1.5 w-full text-xs border border-amber-300 rounded-md px-2 py-1.5 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-400"
          />
        )}
      </div>
    </div>
  );
};

export default KoreksiInfoItem;