import type { DocCategory } from "./Types";

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

export const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const buildZipFilename = (
  prefix: string,
  kategori: DocCategory,
  jalurId?: number | string,
): string => {
  const cat = kategori !== "all" ? `_${kategori}` : "";
  const jal = jalurId ? `_jalur${jalurId}` : "";
  const ts = new Date().toISOString().slice(0, 10);
  return `${prefix}${jal}${cat}_${ts}.zip`;
};

export const getCategoryLabel = (c: DocCategory): string =>
  ({
    all: "Semua Dokumen",
    foto: "Foto",
    dokumen_umum: "Dokumen Umum",
    dokumen_khusus: "Dokumen Khusus",
  })[c];

export const getStatusColor = (status?: string): string => {
  if (!status) return "bg-slate-100 text-slate-500 border-slate-200";
  if (status === "sesuai")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "tidak sesuai") return "bg-red-50 text-red-600 border-red-200";
  return "bg-amber-50 text-amber-600 border-amber-200";
};

// ─────────────────────────────────────────────────────────────────────────────
// File I/O helpers
// ─────────────────────────────────────────────────────────────────────────────

export const writeBlobToDisk = async (
  blob: Blob,
  filename: string,
  onProgress?: (bytes: number) => void,
): Promise<void> => {
  try {
    const ss: any = await import("streamsaver");
    const fileStream = ss.createWriteStream(filename, { size: blob.size });
    const writer = fileStream.getWriter();
    const reader = blob.stream().getReader();
    let written = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
      written += value.byteLength;
      onProgress?.(written);
    }
    await writer.close();
  } catch {
    // Fallback: anchor download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onProgress?.(blob.size);
  }
};

/**
 * Download satu file publik (foto / dok individu) yang URL-nya sudah di-expose
 * oleh backend via getFileUrl(). Tidak butuh auth → native fetch OK.
 * Fallback ke window.open jika gagal.
 */
export const downloadPublicUrl = async (
  fileUrl: string,
  filename: string,
): Promise<void> => {
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    await writeBlobToDisk(blob, filename);
  } catch {
    window.open(fileUrl, "_blank");
  }
};
