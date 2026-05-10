/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Archive,
  CheckSquare,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { DocTypeBadge } from "./DocTypeBadge";
import { FOTO_FIELDS } from "./Constants";
import type { DocCategory, PendaftarWithDocs } from "./Types";
import {
  buildZipFilename,
  formatBytes,
  getStatusColor,
  writeBlobToDisk,
} from "./Utils";
// [PERBAIKAN 1]: Import helper secure download
import { downloadSecureFile } from "@/utils/fileHelper";

// ─────────────────────────────────────────────────────────────────────────────
// PendaftarRow
// ─────────────────────────────────────────────────────────────────────────────

interface PendaftarRowProps {
  item: PendaftarWithDocs;
  selected: boolean;
  onToggle: (id: number) => void;
  filterCategory: DocCategory;
}

export function PendaftarRow({
  item,
  selected,
  onToggle,
  filterCategory,
}: PendaftarRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [downloadingZip, setDlZip] = useState(false);
  const [zipBytes, setZipBytes] = useState(0);
  const [downloadingDoc, setDlDoc] = useState<string | null>(null);

  const dokUmum = item.dokumen_umum ?? [];
  const dokKhusus = item.dokumen_khusus ?? [];
  const fotoList = FOTO_FIELDS.filter((f) => item[f.key as keyof ITrxBeasiswa]);

  const totalDok =
    (filterCategory === "all" || filterCategory === "foto"
      ? fotoList.length
      : 0) +
    (filterCategory === "all" || filterCategory === "dokumen_umum"
      ? dokUmum.length
      : 0) +
    (filterCategory === "all" || filterCategory === "dokumen_khusus"
      ? dokKhusus.length
      : 0);

  // ── ZIP satu pendaftar ────────────────────────────────────────────────────
  const handleZip = async () => {
    setDlZip(true);
    setZipBytes(0);
    try {
      const resp = await beasiswaService.downloadPendaftarZip(
        item.id_trx_beasiswa,
        filterCategory,
      );
      const filename = buildZipFilename(
        `dokumen_${item.kode_pendaftaran ?? item.id_trx_beasiswa}`,
        filterCategory,
      );
      await writeBlobToDisk(resp.data, filename, setZipBytes);
      toast.success("ZIP berhasil diunduh");
    } catch (err: any) {
      toast.error(`Gagal ZIP: ${err?.message ?? "error"}`);
    } finally {
      setDlZip(false);
      setZipBytes(0);
    }
  };

  // ── File individual (Secure Download) ──────────────────────────────────
  const handleSingle = async (
    fileUrl: string,
    filename: string,
    key: string,
  ) => {
    setDlDoc(key);
    try {
      // [PERBAIKAN 2]: Gunakan helper yang mengirimkan header X-Palma-Auth
      await downloadSecureFile(fileUrl, filename);
      toast.success(`Berhasil mengunduh ${filename}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh file. Pastikan Anda memiliki akses.");
    } finally {
      setDlDoc(null);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-150 ${
        selected
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border bg-card"
      }`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id_trx_beasiswa)}
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
          {selected ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">
              {item.nama_lengkap}
            </span>
            {item.jalur && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                {item.jalur}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span className="font-mono">{item.kode_pendaftaran ?? "-"}</span>
            <span>·</span>
            <span className={totalDok === 0 ? "text-red-400" : ""}>
              {totalDok} dokumen
            </span>
            {downloadingZip && zipBytes > 0 && (
              <>
                <span>·</span>
                <span className="text-primary font-mono">
                  {formatBytes(zipBytes)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZip}
            disabled={downloadingZip || totalDok === 0}
            className="h-7 text-xs">
            {downloadingZip ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Archive className="h-3 w-3 mr-1" />
            )}
            {downloadingZip ? "Streaming…" : "ZIP"}
          </Button>

          <button
            onClick={() => setExpanded((v) => !v)}
            className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-md border transition-colors ${
              expanded
                ? "bg-muted border-muted-foreground/20 text-foreground"
                : "bg-transparent border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}>
            {expanded ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Expandable file list ──────────────────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 border-t">
          <div className="pt-3 space-y-2">
            {/* Foto */}
            {(filterCategory === "all" || filterCategory === "foto") &&
              fotoList.map((f) => {
                const url = item[f.key as keyof ITrxBeasiswa] as string;
                if (!url) return null;
                // [PERBAIKAN 3]: Bersihkan parameter &t= atau &token= dari ekstensi
                const ext = url.split(".").pop()?.split("&")[0] ?? "jpg";
                const filename = `${f.key}_${item.kode_pendaftaran ?? item.id_trx_beasiswa}.${ext}`;
                const key = `foto_${f.key}`;
                return (
                  <div
                    key={f.key}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-violet-50/50 border border-violet-100">
                    <DocTypeBadge type="foto" />
                    <span className="flex-1 text-xs truncate">{f.label}</span>
                    <button
                      onClick={() => handleSingle(url, filename, key)}
                      disabled={downloadingDoc === key}
                      className="flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-900 disabled:opacity-50 transition-colors">
                      {downloadingDoc === key ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      Unduh
                    </button>
                  </div>
                );
              })}

            {/* Dokumen Umum */}
            {(filterCategory === "all" || filterCategory === "dokumen_umum") &&
              dokUmum.map((d) => {
                // [PERBAIKAN 4]: Bersihkan parameter &t= atau &token= dari ekstensi
                const ext = d.file?.split(".").pop()?.split("&")[0] ?? "pdf";
                const filename = `umum_${d.id}_${item.kode_pendaftaran ?? item.id_trx_beasiswa}.${ext}`;
                const key = `umum_${d.id}`;
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <DocTypeBadge type="umum" />
                    <span className="flex-1 text-xs truncate">
                      {d.nama_dokumen_persyaratan || `Dokumen #${d.id}`}
                    </span>
                    {d.status_verifikasi && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getStatusColor(d.status_verifikasi)}`}>
                        {d.status_verifikasi}
                      </span>
                    )}
                    <button
                      onClick={() => handleSingle(d.file, filename, key)}
                      disabled={downloadingDoc === key}
                      className="flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 disabled:opacity-50 transition-colors">
                      {downloadingDoc === key ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      Unduh
                    </button>
                  </div>
                );
              })}

            {/* Dokumen Khusus */}
            {(filterCategory === "all" ||
              filterCategory === "dokumen_khusus") &&
              dokKhusus.map((d) => {
                // [PERBAIKAN 5]: Bersihkan parameter &t= atau &token= dari ekstensi
                const ext = d.file?.split(".").pop()?.split("&")[0] ?? "pdf";
                const filename = `khusus_${d.id}_${item.kode_pendaftaran ?? item.id_trx_beasiswa}.${ext}`;
                const key = `khusus_${d.id}`;
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-orange-50/50 border border-orange-100">
                    <DocTypeBadge type="khusus" />
                    <span className="flex-1 text-xs truncate">
                      {d.nama_dokumen_persyaratan || `Dok. Khusus #${d.id}`}
                    </span>
                    {d.status_verifikasi && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getStatusColor(d.status_verifikasi)}`}>
                        {d.status_verifikasi}
                      </span>
                    )}
                    <button
                      onClick={() => handleSingle(d.file, filename, key)}
                      disabled={downloadingDoc === key}
                      className="flex items-center gap-1 text-[11px] font-medium text-orange-700 hover:text-orange-900 disabled:opacity-50 transition-colors">
                      {downloadingDoc === key ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      Unduh
                    </button>
                  </div>
                );
              })}

            {totalDok === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Tidak ada dokumen untuk kategori ini
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}