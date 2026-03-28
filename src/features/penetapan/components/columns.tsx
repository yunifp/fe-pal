/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getPenetapanColumns = (pageIndex: number, pageSize: number): ColumnDef<any>[] => [
  {
    id: "no",
    header: "No (Ranking)",
    cell: ({ row }) => pageIndex * pageSize + row.index + 1,
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.nama_lengkap}</span>,
  },
  {
    accessorKey: "nama_kluster",
    header: "Kluster",
    cell: ({ row }) => {
      const kluster = row.original.nama_kluster;
      return (
        <Badge variant={kluster === "Afirmasi" ? "destructive" : "default"}>
          {kluster || "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "pt_final",
    header: "Perguruan Tinggi (PT) Final",
    cell: ({ row }) => <span className="text-blue-700 font-semibold">{row.original.pt_final || "-"}</span>,
  },
  {
    accessorKey: "prodi_final",
    header: "Program Studi Final",
    cell: ({ row }) => <span className="text-purple-700 font-semibold">{row.original.prodi_final || "-"}</span>,
  },
];