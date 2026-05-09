import type { ColumnDef } from "@tanstack/react-table";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

// ─── Helper Format Waktu ──────────────────────────────────────────────────
const formatWaktuKunci = (dateString?: string | null) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${dayName}, ${day} ${month} ${year} : ${hours}:${minutes}:${seconds}`;
};
// ──────────────────────────────────────────────────────────────────────────

export const getPendaftarColumns = (): ColumnDef<ITrxBeasiswa>[] => [
  {
    id: "nomor",
    header: "No",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {row.index + 1}
      </span>
    ),
    size: 48,
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama Pendaftar",
    cell: ({ row }) => {
      const nama = row.original.nama_lengkap ?? "-";
      const inisial = nama
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {inisial}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{nama}</div>
            <div className="text-xs text-muted-foreground">
              NIK: {row.original.nik ?? "-"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-mono">
          {row.original.kode_pendaftaran ?? (
            <span className="text-muted-foreground italic text-xs">
              Belum ada No Registrasi Pendaftaran
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "tinggal_kab_kota",
    header: "Domisili",
    cell: ({ row }) => (
      <div>
        <div className="text-sm">{row.original.tinggal_kab_kota ?? "-"}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {row.original.tinggal_prov ?? "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "jalur",
    header: "Jalur",
    cell: ({ row }) => {
      const jalur = row.original.jalur;
      if (!jalur)
        return <span className="text-muted-foreground text-xs">-</span>;

      const isAfirmasi = jalur.toLowerCase().includes("afirmasi");
      return (
        <Badge
          variant="outline"
          className={
            isAfirmasi
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-blue-300 bg-blue-50 text-blue-700"
          }>
          {jalur}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const flow = row.original.flow;
      if (!flow)
        return <span className="text-muted-foreground text-xs">-</span>;

      const isAfirmasi = flow.toLowerCase().includes("afirmasi");
      return (
        <Badge
          variant="outline"
          className={
            isAfirmasi
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-blue-300 bg-blue-50 text-blue-700"
          }>
          {flow}
        </Badge>
      );
    },
  },
  {
    accessorKey: "timestamp_lock_selektor",
    header: "Waktu Kunci Selektor",
    cell: ({ row }) => {
      const lockTime = row.original.timestamp_lock_selektor;
      if (!lockTime) {
        return <span className="text-muted-foreground text-xs italic">-</span>;
      }
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span>{formatWaktuKunci(lockTime)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "verifikator_nama",
    header: "Selektor",
    cell: ({ row }) => {
      const nama = row.original.verifikator_nama;
      const idVerifikator = row.original.id_verifikator;

      if (!nama && !idVerifikator) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            Belum ter-assign
          </span>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {nama?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-sm truncate">{nama ?? `-`}</div>
          </div>
        </div>
      );
    },
  },
];