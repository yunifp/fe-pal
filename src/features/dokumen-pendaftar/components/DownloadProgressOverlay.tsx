import { Download, Loader2, X } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { formatBytes } from "./Utils";
import type { DownloadPhase, DownloadProgress } from "./Types";

const PHASE_TEXT: Record<DownloadPhase, (p: DownloadProgress) => string> = {
  preparing: () => "Menyiapkan data...",
  downloading: (p) =>
    p.total > 1 ? `Batch ${p.current} / ${p.total}` : "Mengunduh...",
  done: () => "Selesai!",
  error: () => "Gagal",
};

interface Props {
  p: DownloadProgress;
  onCancel?: () => void;
}

export function DownloadProgressOverlay({ p, onCancel }: Props) {
  if (!p.isActive) return null;

  const pct = p.total > 1 ? Math.round((p.current / p.total) * 100) : 0;
  const isActive = p.phase === "preparing" || p.phase === "downloading";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">
      <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl p-5 pointer-events-auto">
        {/* Icon + label + cancel */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              p.phase === "error"
                ? "bg-red-100"
                : p.phase === "done"
                  ? "bg-emerald-100"
                  : "bg-primary/10"
            }`}>
            {p.phase === "error" ? (
              <X className="h-4 w-4 text-red-600" />
            ) : p.phase === "done" ? (
              <Download className="h-4 w-4 text-emerald-600" />
            ) : (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{PHASE_TEXT[p.phase](p)}</p>
            {p.label && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {p.label}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {p.bytesReceived > 0 && (
              <span className="text-xs font-mono text-muted-foreground">
                {formatBytes(p.bytesReceived)}
              </span>
            )}

            {/* Tombol cancel — hanya muncul saat download aktif */}
            {isActive && onCancel && (
              <button
                onClick={onCancel}
                title="Batalkan download"
                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar (hanya untuk multi-batch) */}
        {p.total > 1 && (
          <>
            <ProgressBar value={pct} />
            <p className="text-xs text-right text-muted-foreground mt-1 tabular-nums">
              {pct}%
            </p>
          </>
        )}
      </div>
    </div>
  );
}
