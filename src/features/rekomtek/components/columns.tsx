/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus, RotateCcw } from "lucide-react";

export const getRekomtekColumns = (
  pageIndex: number, 
  pageSize: number,
  onResign: (id: number, nama: string) => void,
  onCancelResign: (id: number, nama: string) => void
): ColumnDef<any>[] => [
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
    cell: ({ row }) => {
      const isResigned = row.original.status_undur_diri === "Y";
      return (
        <div className="flex flex-col gap-1">
          <span className={`font-semibold ${isResigned ? "text-slate-400 line-through" : "text-slate-800"}`}>
            {row.original.nama_lengkap}
          </span>
          {isResigned && (
            <Badge variant="destructive" className="w-fit text-[10px] py-0">Mengundurkan Diri</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "jenjang_sekolah", // <--- KOLOM BARU DITAMBAHKAN
    header: "Jenjang Pendidikan",
    cell: ({ row }) => <span className="text-slate-600">{row.original.jenjang_sekolah || "-"}</span>
  },
  {
    accessorKey: "pt_final",
    header: "PT Final",
  },
  {
    accessorKey: "prodi_final",
    header: "Prodi Final",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      const isResigned = data.status_undur_diri === "Y";
      
      if (isResigned) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancelResign(data.id_trx_beasiswa, data.nama_lengkap)}
            className="flex items-center gap-1 h-8 text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
          >
            <RotateCcw className="w-3 h-3" /> Batal Mundur
          </Button>
        );
      }

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResign(data.id_trx_beasiswa, data.nama_lengkap)}
          className="flex items-center gap-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
        >
          <UserMinus className="w-3 h-3" /> Undur Diri
        </Button>
      );
    }
  }
];