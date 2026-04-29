import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { INikCekal } from "@/types/nikCekal";

export const getColumns = (
  page: number,
  limit: number,
  onEdit: (data: INikCekal) => void,
  onDelete: (id: number, identitas: string) => void
): ColumnDef<INikCekal>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => <span className="text-slate-500">{(page - 1) * limit + info.row.index + 1}</span>,
    size: 60,
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => <span className="text-slate-700 font-medium">{row.original.nama || "-"}</span>,
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.nik}</span>,
  },
  {
    accessorKey: "tahun",
    header: "Tahun",
    cell: ({ row }) => <span className="text-slate-600">{row.original.tahun || "-"}</span>,
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    cell: ({ row }) => <span className="text-slate-600">{row.original.keterangan || "-"}</span>,
  },
  {
    accessorKey: "is_aktif",
    header: "Aktif Cekal",
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        {row.original.is_aktif === "Y" && (
          <Check className="w-5 h-5 text-emerald-600 font-bold" />
        )}
      </div>
    ),
    size: 100,
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original;
      const identitas = `${data.nik} ${data.nama ? `(${data.nama})` : ''}`;
      
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
                onDelete(data.id, identitas);
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