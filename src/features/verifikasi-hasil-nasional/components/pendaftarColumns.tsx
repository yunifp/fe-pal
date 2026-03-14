import type { ColumnDef } from "@tanstack/react-table";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const getPendaftarColumns = (
  onViewDetail: (id: number) => void,
): ColumnDef<ITrxBeasiswa>[] => [
  {
    accessorKey: "nama_lengkap",
    header: "Nama Lengkap",
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.original.nama_lengkap}</div>
          <div className="text-xs text-muted-foreground">
            NIK: {row.original.nik}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Kontak",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          <div>{row.original.email}</div>
          <div className="text-muted-foreground">{row.original.no_hp}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "tempat_lahir",
    header: "Tempat, Tanggal Lahir",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          <div>{row.original.tempat_lahir}</div>
          <div className="text-muted-foreground">
            {row.original.tanggal_lahir}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sekolah",
    header: "Asal Sekolah",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          <div>{row.original.sekolah}</div>
          <div className="text-muted-foreground">{row.original.jurusan}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "jalur",
    header: "Jalur",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.jalur}</Badge>;
    },
  },
  {
    accessorKey: "status_lulus_administrasi",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status_lulus_administrasi;
      return (
        <Badge
          variant={
            status === "Y"
              ? "success"
              : status === "N"
                ? "destructive"
                : "secondary"
          }>
          {status === "Y"
            ? "Lulus"
            : status === "N"
              ? "Tidak Lulus"
              : "Pending"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail(row.original.id_trx_beasiswa)}>
          <Eye className="mr-2 h-4 w-4" />
          Detail
        </Button>
      );
    },
  },
];
