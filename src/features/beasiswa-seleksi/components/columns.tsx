import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import useHasAccess from "@/hooks/useHasAccess";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import BadgeFlowBeasiswa from "@/components/beasiswa/BadgeFlowBeasiswa";
import { ShieldCheck, Eye, User, FileDown, Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { beasiswaService } from "@/services/beasiswaService";
import { SecureImage } from "@/components/SecureImage";

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

// ⚠️ Hooks (useNavigate, useHasAccess) must NOT be called inside cell renderers.
// They belong in a wrapper component instead.
const ActionCell = ({ beasiswa }: { beasiswa: ITrxBeasiswa }) => {
  const navigate = useNavigate();
  const canUpdate = useHasAccess("U");
  const [isDownloading, setIsDownloading] = useState(false);

  const isViewOnly = [3, 4, 6, 7, 9, 10, 11, 12, 13].includes(
    beasiswa.id_flow ?? 0,
  );

  const hasBeenVerified = (beasiswa.id_flow ?? 0) > 2;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await beasiswaService.downloadPdfHasilVerifikasi(beasiswa.id_trx_beasiswa);
    } catch (error) {
      console.error("Gagal mengunduh PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!canUpdate && !isViewOnly) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isViewOnly ? "outline" : "default"}
        className={
          isViewOnly
            ? "gap-1.5 text-muted-foreground"
            : "gap-1.5 bg-primary hover:bg-primary/90"
        }
        onClick={() =>
          navigate(`/beasiswa_seleksi/detail/${beasiswa.id_trx_beasiswa}`)
        }>
        {isViewOnly ? (
          <>
            <Eye className="h-3.5 w-3.5" />
            Lihat
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            Verifikasi
          </>
        )}
      </Button>

      {hasBeenVerified && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          title="Unduh Hasil Verifikasi PDF"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileDown className="h-3.5 w-3.5" />
          )}
          PDF
        </Button>
      )}
    </div>
  );
};

export const getColumns = (): ColumnDef<ITrxBeasiswa>[] => [
  {
    id: "no",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide">
        No
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {String(row.index + 1).padStart(2, "0")}
      </span>
    ),
    size: 50,
  },
  {
    id: "pendaftar",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide">
        Pendaftar
      </span>
    ),
    cell: ({ row }) => {
      const { foto, nama_lengkap, nik } = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          {foto ? (
            <SecureImage
              src={foto}
              alt={nama_lengkap ?? ""}
              className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight truncate">
              {nama_lengkap}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{nik}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "no_reg",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide">
        No Registrasi
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-mono text-foreground">
        {row.original.kode_pendaftaran ?? "-"}
      </span>
    ),
  },
  {
    id: "jalur",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide">
        Jalur
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.jalur ?? "-"}
      </span>
    ),
  },
  {
    id: "waktu_kunci",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        Waktu Kunci
      </span>
    ),
    cell: ({ row }) => {
      const lockTime = row.original.timestamp_lock_selektor;
      if (!lockTime) {
        return <span className="text-muted-foreground text-xs italic">-</span>;
      }
      return (
        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
          {formatWaktuKunci(lockTime)}
        </span>
      );
    },
  },
  {
    id: "status_pendaftaran",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide ">
        Status
      </span>
    ),
    cell: ({ row }) => <BadgeFlowBeasiswa id={row.original.id_flow} />,
  },
  {
    id: "aksi",
    header: () => (
      <span className="text-xs font-semibold -foreground uppercase tracking-wide">
        Aksi
      </span>
    ),
    cell: ({ row }) => <ActionCell beasiswa={row.original} />,
  },
];