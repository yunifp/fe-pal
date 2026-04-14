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
import type { ISukuMaster } from "@/types/suku";

export const getColumns = (
  page: number,
  limit: number,
  onEdit: (data: ISukuMaster) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<ISukuMaster>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => <span className="text-slate-500">{(page - 1) * limit + info.row.index + 1}</span>,
    size: 60,
  },
  {
    accessorKey: "nama_suku",
    header: "Nama Suku",
    cell: ({ row }) => (
      <div className="font-bold text-slate-900 whitespace-normal break-words min-w-[200px] max-w-[400px]">
        {row.original.nama_suku}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status Aktif",
    cell: ({ row }) => {
      const isActive = row.original.is_active === "Y";
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm border ${
          isActive 
            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
            : "bg-slate-50 border-slate-200 text-slate-500"
        }`}>
          {isActive ? "AKTIF" : "NON-AKTIF"}
        </span>
      );
    },
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
              className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors"
              onClick={() => onEdit(data)}
            >
              <Edit className="h-4 w-4 mr-2" /> Ubah Data
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2.5 font-medium transition-colors"
              onSelect={(e) => {
                e.preventDefault(); 
                onDelete(data.id, data.nama_suku);
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