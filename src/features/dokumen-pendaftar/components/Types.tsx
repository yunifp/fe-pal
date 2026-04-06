import type { ITrxBeasiswa } from "@/types/beasiswa";

// ─────────────────────────────────────────────────────────────────────────────
// Domain Types
// ─────────────────────────────────────────────────────────────────────────────

export type DocCategory = "all" | "foto" | "dokumen_umum" | "dokumen_khusus";

export interface DokumenItem {
  id: number;
  nama_dokumen_persyaratan: string;
  file: string;
  status_verifikasi?: string;
}

export interface PendaftarWithDocs extends ITrxBeasiswa {
  dokumen_umum?: DokumenItem[];
  dokumen_khusus?: DokumenItem[];
}

export type DownloadPhase = "preparing" | "downloading" | "done" | "error";

export interface DownloadProgress {
  isActive: boolean;
  current: number;
  total: number;
  label: string;
  bytesReceived: number;
  phase: DownloadPhase;
}
