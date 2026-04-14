/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const getPenetapanColumns = (pageIndex: number, pageSize: number): ColumnDef<any>[] => [
  {
    id: "no",
    header: "No (Ranking)",
    cell: ({ row }) => <span className="text-slate-500">{pageIndex * pageSize + row.index + 1}</span>,
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
    cell: ({ row }) => <span className="font-mono text-slate-600">{row.original.kode_pendaftaran}</span>,
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama Lengkap",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_lengkap}</span>,
  },
  {
    accessorKey: "nama_kluster",
    header: "Kluster",
    cell: ({ row }) => {
      const kluster = row.original.nama_kluster;
      return (
        <Badge 
          variant={kluster === "Afirmasi" ? "destructive" : "secondary"}
          className={kluster === "Afirmasi" ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-none shadow-none" : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-none"}
        >
          {kluster || "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "pt_final",
    header: "Kampus Diterima",
    cell: ({ row }) => <span className="text-teal-700 font-bold">{row.original.pt_final || "-"}</span>,
  },
  {
    accessorKey: "prodi_final",
    header: "Program Studi Diterima",
    cell: ({ row }) => <span className="text-emerald-700 font-semibold">{row.original.prodi_final || "-"}</span>,
  },
];