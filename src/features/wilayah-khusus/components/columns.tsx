/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, RefreshCw, Check, Minus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IWilayahKhusus } from "@/types/wilayahKhusus";

const RenderStatusIcon = ({ isActive }: { isActive: boolean }) => {
  return isActive ? (
    <div className="flex justify-center">
      <div className="p-1 bg-emerald-100 rounded-full w-fit">
        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <Minus className="w-5 h-5 text-slate-300" />
    </div>
  );
};

export const getColumns = (
  onEdit: (data: IWilayahKhusus) => void,
  onReset: (id: number, nama: string) => void
): ColumnDef<IWilayahKhusus>[] => [
  {
    id: "no",
    header: "No",
    cell: (info) => <span className="text-slate-500">{info.row.index + 1}</span>,
    size: 60,
  },
  {
    accessorKey: "nama_provinsi",
    header: "Provinsi",
    cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.nama_provinsi}</span>,
  },
  {
    accessorKey: "nama_kabkota",
    header: "Kabupaten/Kota",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_kabkota}</span>,
  },
  {
    id: "wilayah_3t",
    header: () => <div className="text-center">Wilayah 3T</div>,
    cell: ({ row }) => <RenderStatusIcon isActive={row.original.wilayah_3t} />,
  },
  {
    id: "wilayah_perbatasan",
    header: () => <div className="text-center">Wilayah Perbatasan</div>,
    cell: ({ row }) => <RenderStatusIcon isActive={row.original.wilayah_perbatasan} />,
  },
  {
    id: "wilayah_papua_nusateng",
    header: () => <div className="text-center">Papua, Maluku, Maluku Utara, dan NT</div>,
    cell: ({ row }) => <RenderStatusIcon isActive={row.original.wilayah_papua_nusateng} />,
  },
  {
    id: "is_khusus",
    header: () => <div className="text-center">Status Khusus</div>,
    cell: ({ row }) => {
      const isKhusus = row.original.is_khusus;
      return (
        <div className="flex justify-center">
          {isKhusus ? (
            <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">KHUSUS</span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
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
            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">Pengaturan</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors text-slate-700"
              onClick={() => onEdit(data)}
            >
              <Edit className="h-4 w-4 mr-2" /> Ubah Status
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!data.is_khusus}
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2.5 font-medium transition-colors"
              onSelect={(e) => {
                e.preventDefault(); 
                onReset(data.wilayah_id, data.nama_kabkota);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];