import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import BadgeFlowBeasiswa from "@/components/beasiswa/BadgeFlowBeasiswa";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonRow = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="w-16 h-20 rounded" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const getColumns = (isLoading?: boolean): ColumnDef<ITrxBeasiswa>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) =>
      isLoading ? (
        <Skeleton className="h-4 w-6" />
      ) : (
        <span className="text-muted-foreground text-sm">{row.index + 1}</span>
      ),
  },
  {
    id: "pendaftar",
    header: "Pendaftar",
    cell: ({ row }) =>
      isLoading ? (
        <SkeletonRow />
      ) : (
        <div className="flex items-center gap-3 py-1">
          <div className="relative flex-shrink-0">
            <img
              src={row.original.foto!}
              alt={row.original.nama_lengkap!}
              className="w-14 h-18 object-cover rounded-md border border-border"
              style={{ height: "72px", width: "56px" }}
            />
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-sm leading-tight">
              {row.original.nama_lengkap}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {row.original.nik}
            </p>
          </div>
        </div>
      ),
  },
  {
    id: "no_reg",
    header: "No. Registrasi",
    cell: ({ row }) =>
      isLoading ? (
        <Skeleton className="h-4 w-28" />
      ) : (
        <span className="text-sm font-mono text-muted-foreground">
          {row.original.kode_pendaftaran}
        </span>
      ),
  },
  {
    id: "jalur",
    header: "Jalur",
    cell: ({ row }) =>
      isLoading ? (
        <Skeleton className="h-6 w-24 rounded-full" />
      ) : (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
          {row.original.jalur}
        </span>
      ),
  },
  {
    id: "status_pendaftaran",
    header: "Status",
    cell: ({ row }) => {
      if (isLoading) return <Skeleton className="h-6 w-28 rounded-md" />;
      if (row.original.id_flow === 13) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {row.original.flow ?? "Lulus — Pembagian Wilayah"}
          </span>
        );
      }
      return <BadgeFlowBeasiswa id={row.original.id_flow} />;
    },
  },
  {
    id: "hasil_dinas_kabkot",
    header: "Hasil Verifikasi",
    cell: ({ row }) => {
      if (isLoading) return <Skeleton className="h-6 w-32 rounded-md" />;

      const value = row.original.hasil_dinas_kabkot;
      const config = {
        "1": {
          label: "Rekomendasi",
          dot: "bg-green-500",
          cls: "bg-green-50 text-green-700 border-green-200",
        },
        "2": {
          label: "Tidak Rekomendasi",
          dot: "bg-red-500",
          cls: "bg-red-50 text-red-700 border-red-200",
        },
        "0": {
          label: "Belum Diverifikasi",
          dot: "bg-yellow-500",
          cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
        },
      } as const;

      const item = config[value as keyof typeof config];
      if (!item)
        return <span className="text-xs text-muted-foreground">—</span>;

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${item.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
          {item.label}
        </span>
      );
    },
  },
  {
    id: "aksi",
    header: "",
    cell: ({ row }) => {
      if (isLoading) return <Skeleton className="h-9 w-28 rounded-md" />;

      const beasiswa = row.original;
      const navigate = useNavigate();
      const isVerifikasi = beasiswa.id_flow === 6;

      return (
        <Button
          size="sm"
          variant={isVerifikasi ? "default" : "outline"}
          className="gap-1.5 text-xs"
          onClick={() =>
            navigate(
              `/beasiswa_verifikasi_dinas_kota/detail/${beasiswa.id_trx_beasiswa}`,
            )
          }>
          {isVerifikasi ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              Verifikasi
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              Lihat Detail
            </>
          )}
        </Button>
      );
    },
  },
];
