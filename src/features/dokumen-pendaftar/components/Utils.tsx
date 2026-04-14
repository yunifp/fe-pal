import type { DocCategory } from "./Types";
import { useAuthStore } from "@/stores/authStore";
import { BEASISWA_SERVICE_BASE_URL } from "@/constants/api";

// ─────────────────────────────────────────────────────────────────────────────
// Constants — sama persis dengan yang dipakai axiosInstanceJson di beasiswaService
// ─────────────────────────────────────────────────────────────────────────────

export const BEASISWA_FETCH_BASE_URL = BEASISWA_SERVICE_BASE_URL;

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
  (
    ({
      all: "Semua Dokumen",
      foto: "Foto",
      dokumen_umum: "Dokumen Umum",
      dokumen_khusus: "Dokumen Khusus",
    }) as Record<DocCategory, string>
  )[c];

export const getStatusColor = (status?: string): string => {
  if (!status) return "bg-slate-100 text-slate-500 border-slate-200";
  if (status === "sesuai")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "tidak sesuai") return "bg-red-50 text-red-600 border-red-200";
  return "bg-amber-50 text-amber-600 border-amber-200";
};

// ─────────────────────────────────────────────────────────────────────────────
// Stream download — pipe fetch langsung ke disk via StreamSaver
// Tidak ada Axios, tidak ada RAM buffer, tidak ada timeout
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamDownloadOptions {
  url: string;
  method?: "GET" | "POST";
  body?: unknown;
  filename: string;
  headers?: Record<string, string>;
  onProgress?: (bytes: number, total?: number) => void;
  signal?: AbortSignal;
}

export const streamDownloadToDisk = async ({
  url,
  method = "POST",
  body,
  filename,
  headers = {},
  onProgress,
  signal,
}: StreamDownloadOptions): Promise<void> => {
  // Ambil token dari auth store — sama persis dengan Axios interceptor
  const token = useAuthStore.getState().accessToken ?? "";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Server error ${response.status}: ${text || response.statusText}`,
    );
  }

  if (!response.body) {
    throw new Error("Response body kosong — server tidak mengirim stream");
  }

  const contentLength = response.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : undefined;

  // Coba StreamSaver dulu (true streaming, tidak ada RAM buffer)
  try {
    const ss: any = await import("streamsaver");
    const fileStream = ss.createWriteStream(filename, { size: total });
    const writer = fileStream.getWriter();
    const reader = response.body.getReader();
    let written = 0;

    const onBeforeUnload = () => writer.abort();
    window.addEventListener("beforeunload", onBeforeUnload);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(value);
        written += value.byteLength;
        onProgress?.(written, total);
      }
      await writer.close();
    } finally {
      window.removeEventListener("beforeunload", onBeforeUnload);
    }
  } catch {
    // Fallback: kumpulkan chunk → Blob → anchor download
    console.warn("[download] StreamSaver tidak tersedia, fallback ke blob URL");

    const reader = response.body.getReader();
    const allChunks: ArrayBuffer[] = [];
    let written = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      allChunks.push(
        value.buffer.slice(
          value.byteOffset,
          value.byteOffset + value.byteLength,
        ),
      );
      written += value.byteLength;
      onProgress?.(written, total);
    }

    const blob = new Blob(allChunks, { type: "application/zip" });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Download file publik (foto/dok individu) — tidak butuh auth
// ─────────────────────────────────────────────────────────────────────────────

export const downloadPublicUrl = async (
  fileUrl: string,
  filename: string,
): Promise<void> => {
  try {
    const resp = await fetch(fileUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    window.open(fileUrl, "_blank");
  }
};

// Alias lama — backward compat
export const writeBlobToDisk = async (
  blob: Blob,
  filename: string,
  onProgress?: (bytes: number) => void,
): Promise<void> => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  onProgress?.(blob.size);
};
