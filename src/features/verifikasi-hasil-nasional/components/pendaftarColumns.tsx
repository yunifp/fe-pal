import type { ColumnDef } from "@tanstack/react-table";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, MapPin, BookOpen, Route } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ColHeader = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold uppercase tracking-wide ">
    {children}
  </span>
);

const StatusBadge = ({ status }: { status?: string | null }) => {
  if (status === "Y")
    return (
      <Badge variant="success" className="text-xs">
        Lulus
      </Badge>
    );
  if (status === "N")
    return (
      <Badge variant="destructive" className="text-xs">
        Tidak Lulus
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-xs">
      Pending
    </Badge>
  );
};

// ─── Columns ────────────────────────────────────────────────────────────────

export const getPendaftarColumns = (
  onViewDetail: (id: number) => void,
): ColumnDef<ITrxBeasiswa>[] => [
  {
    id: "no",
    header: () => <ColHeader>No</ColHeader>,
    cell: ({ row }) => (
      <span className="text-sm font-mono text-muted-foreground">
        {String(row.index + 1).padStart(2, "0")}
      </span>
    ),
    size: 48,
  },
  {
    accessorKey: "nama_lengkap",
    header: () => (
      <ColHeader>
        <User className="inline w-3 h-3 mr-1 mb-0.5" />
        Pendaftar
      </ColHeader>
    ),
    cell: ({ row }) => {
      const { nama_lengkap, nik } = row.original;
      return (
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug truncate">
            {nama_lengkap ?? "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">NIK: {nik}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <ColHeader>Kontak</ColHeader>,
    cell: ({ row }) => {
      const { email, no_hp } = row.original;
      return (
        <div className="text-sm space-y-0.5">
          <p className="truncate max-w-[180px]">{email ?? "-"}</p>
          <p className="text-muted-foreground text-xs">{no_hp ?? "-"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "tempat_lahir",
    header: () => (
      <ColHeader>
        <MapPin className="inline w-3 h-3 mr-1 mb-0.5" />
        Tempat / Tgl Lahir
      </ColHeader>
    ),
    cell: ({ row }) => {
      const { tempat_lahir, tanggal_lahir } = row.original;
      return (
        <div className="text-sm space-y-0.5">
          <p>{tempat_lahir ?? "-"}</p>
          <p className="text-muted-foreground text-xs">
            {tanggal_lahir ?? "-"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "sekolah",
    header: () => (
      <ColHeader>
        <BookOpen className="inline w-3 h-3 mr-1 mb-0.5" />
        Asal Sekolah
      </ColHeader>
    ),
    cell: ({ row }) => {
      const { sekolah, jurusan } = row.original;
      return (
        <div className="text-sm space-y-0.5">
          <p className="truncate max-w-[180px]">{sekolah ?? "-"}</p>
          <p className="text-muted-foreground text-xs">{jurusan ?? "-"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "jalur",
    header: () => (
      <ColHeader>
        <Route className="inline w-3 h-3 mr-1 mb-0.5" />
        Jalur
      </ColHeader>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-normal">
        {row.original.jalur ?? "-"}
      </Badge>
    ),
  },
  {
    accessorKey: "status_lulus_administrasi",
    header: () => <ColHeader>Status</ColHeader>,
    cell: ({ row }) => (
      <StatusBadge status={row.original.status_lulus_administrasi} />
    ),
  },
  {
    id: "actions",
    header: () => <ColHeader>Aksi</ColHeader>,
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 h-8 text-xs"
        onClick={() => onViewDetail(row.original.id_trx_beasiswa)}>
        <Eye className="h-3.5 w-3.5" />
        Detail
      </Button>
    ),
  },
];
