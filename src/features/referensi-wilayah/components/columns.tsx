import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IReferensiWilayah } from "@/types/wilayah";

export const getColumnsWilayah = (
  level: "provinsi" | "kabkota" | "kecamatan",
  onEdit: (data: IReferensiWilayah) => void,
  onDelete: (id: number, nama: string) => void
): ColumnDef<IReferensiWilayah>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => <span className="text-slate-500">{info.row.index + 1}</span>,
    size: 60,
  },
  {
    accessorKey: level === "provinsi" ? "kode_pro" : level === "kabkota" ? "kode_kab" : "kode_kec",
    header: `Kode ${level === "provinsi" ? "Provinsi" : level === "kabkota" ? "Kab/Kota" : "Kecamatan"}`,
    cell: ({ row }) => {
      const code = level === "provinsi" ? row.original.kode_pro : level === "kabkota" ? row.original.kode_kab : row.original.kode_kec;
      return <span className="font-mono text-slate-600 font-medium">{code}</span>;
    }
  },
  {
    accessorKey: "nama_wilayah",
    header: "Nama Wilayah",
    cell: ({ row }) => {
      const data = row.original;
      
      if (level === "kecamatan") {
        return <span className="font-bold text-slate-800">{data.nama_wilayah}</span>;
      }

      const nextUrl = level === "provinsi" 
        ? `/master/referensi-wilayah/${data.kode_pro}` 
        : `/master/referensi-wilayah/${data.kode_pro}/${data.kode_kab}`;

      return (
        <Link to={nextUrl} className="group inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          <span className="group-hover:underline decoration-emerald-300 underline-offset-4">{data.nama_wilayah}</span> 
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 transition-colors group-hover:translate-x-0.5" />
        </Link>
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
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-sans space-y-1 rounded-xl shadow-lg border-slate-100 p-2 min-w-[160px]">
            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors text-slate-700"
              onClick={() => onEdit(data)}
            >
              <Edit className="h-4 w-4 mr-2" /> Ubah Nama
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2.5 font-medium transition-colors"
              onSelect={(e) => {
                e.preventDefault(); 
                onDelete(data.wilayah_id, data.nama_wilayah);
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