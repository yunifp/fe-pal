/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IDokumenKhusus } from "@/types/dokumenkhusus";

const StatusBadge = ({ value }: { value: string }) => {
  const isYes = value === "Y";
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm border ${
      isYes 
        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
        : "bg-slate-50 border-slate-200 text-slate-500"
    }`}>
      {isYes ? "YA" : "TIDAK"}
    </span>
  );
};

export const getColumns = (
  page: number,
  limit: number,
  onEdit: (data: IDokumenKhusus) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<IDokumenKhusus>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => <span className="text-slate-500">{(page - 1) * limit + info.row.index + 1}</span>,
    size: 60,
  },
  {
    id: "jalur",
    header: "Jalur Pendaftaran",
    cell: ({ row }) => (
      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs shadow-sm">
        {row.original.jalur_ref?.jalur || "-"}
      </span>
    ),
  },
  {
    accessorKey: "persyaratan",
    header: "Nama Dokumen Khusus",
    cell: ({ row }) => (
      <div className="font-bold text-slate-900 whitespace-normal break-words min-w-[200px] max-w-[300px] leading-relaxed">
        {row.original.persyaratan}
      </div>
    ),
  },
  // --- TAMBAHAN KOLOM NAMA FILE UNDUH ---
  {
    accessorKey: "nama_file_unduh",
    header: "Template File",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-600 truncate max-w-[150px] inline-block">
        {row.original.nama_file_unduh || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status_aktif",
    header: "Aktif",
    cell: ({ row }) => <StatusBadge value={row.original.status_aktif} />,
  },
  {
    accessorKey: "is_required",
    header: "Wajib",
    cell: ({ row }) => <StatusBadge value={row.original.is_required} />,
  },
  {
    accessorKey: "is_kabkota",
    header: "Kab/Kota",
    cell: ({ row }) => <StatusBadge value={row.original.is_kabkota ?? "N"} />,
  },
  {
    accessorKey: "is_prov",
    header: "Provinsi",
    cell: ({ row }) => <StatusBadge value={row.original.is_prov ?? "N"} />,
  },
  {
    accessorKey: "valid_type",
    header: "Format",
    cell: ({ row }) => (
      <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">
        {row.original.valid_type || "*"}
      </code>
    ),
  },
  {
    accessorKey: "size",
    header: "Max Size",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-700">
        {row.original.size ? `${row.original.size} MB` : "-"}
      </span>
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors shadow-none">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-sans space-y-1 rounded-xl shadow-lg border-slate-100 p-2 min-w-[160px]">
            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">Opsi</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors text-slate-700"
              onClick={() => onEdit(data)}
            >
              <Edit className="h-4 w-4 mr-2" /> Ubah Data
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2.5 font-medium transition-colors"
              onSelect={(e) => {
                e.preventDefault(); 
                onDelete(data.id, data.persyaratan);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];