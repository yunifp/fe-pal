// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const FOTO_FIELDS = [
  { key: "foto", label: "Foto Wajah" },
  { key: "foto_depan", label: "Foto Depan" },
  { key: "foto_samping_kiri", label: "Foto Samping Kiri" },
  { key: "foto_samping_kanan", label: "Foto Samping Kanan" },
  { key: "foto_belakang", label: "Foto Belakang" },
] as const;

export const BULK_CHUNK_SIZE = 50; // pendaftar per batch saat mode chunked
