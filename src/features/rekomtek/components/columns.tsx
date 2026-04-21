/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus, RotateCcw } from "lucide-react";

export const getRekomtekColumns = (
  pageIndex: number,
  pageSize: number,
  onResign: (id: number, nama: string) => void,
  onCancelResign: (id: number, nama: string) => void,
  canUpdate: boolean
): ColumnDef<any>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-slate-500">{pageIndex * pageSize + row.index + 1}</span>,
  },
  {
    accessorKey: "kode_pendaftaran",
    header: "Kode Pendaftaran",
    cell: ({ row }) => <span className="font-mono text-slate-600">{row.original.kode_pendaftaran}</span>
  },
  {
    accessorKey: "nama_lengkap",
    header: "Nama Lengkap",
    cell: ({ row }) => {
      const isResigned = row.original.status_undur_diri === "Y";
      return (
        <div className="flex flex-col gap-1.5 py-1">
          <span className={`font-semibold ${isResigned ? "text-slate-400 line-through decoration-slate-300" : "text-slate-900"}`}>
            {row.original.nama_lengkap}
          </span>
          {isResigned && (
            <Badge variant="destructive" className="w-fit text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 shadow-none font-medium">
              Mengundurkan Diri
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "jenjang_pendidikan_diterima",
    header: "Jenjang Pendidikan",
    cell: ({ row }) => <span className="text-slate-600">{row.original.jenjang_pendidikan_diterima || "-"}</span>
  },
  {
    accessorKey: "pt_final",
    header: "Perguruan Tinggi Diterima",
    cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.pt_final}</span>
  },
  {
    accessorKey: "prodi_final",
    header: "Program Studi Diterima",
    cell: ({ row }) => <span className="text-slate-600">{row.original.prodi_final}</span>
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      if (!canUpdate) return <span className="text-slate-400">-</span>;

      const data = row.original;
      const isResigned = data.status_undur_diri === "Y";

      if (isResigned) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancelResign(data.id_trx_beasiswa, data.nama_lengkap)}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-colors shadow-none"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Batal Mundur
          </Button>
        );
      }

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResign(data.id_trx_beasiswa, data.nama_lengkap)}
          className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors shadow-none"
        >
          <UserMinus className="w-3.5 h-3.5" /> Undur Diri
        </Button>
      );
    }
  }
];