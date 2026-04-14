import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { INpsn } from "@/types/master";
import type { NavigateFunction } from "react-router-dom";

type NpsnColumnsProps = {
  onDeleteClick: (id: number) => void;
  navigate: NavigateFunction;
  canUpdate: boolean;
  canDelete: boolean;
};

export const getNpsnColumns = ({
  onDeleteClick,
  navigate,
}: NpsnColumnsProps): ColumnDef<INpsn>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span>,
    size: 60,
  },
  {
    accessorKey: "npsn",
    header: "NPSN",
    cell: ({ row }) => <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{row.original.npsn ?? "-"}</span>,
  },
  {
    accessorKey: "sekolah",
    header: "Nama Sekolah",
    cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.sekolah}</span>,
  },
  {
    accessorKey: "jenis_sekolah",
    header: "Jenis Sekolah",
    cell: ({ row }) => (
      <span className="font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200 uppercase">
        {row.original.jenis_sekolah ?? "-"}
      </span>
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const npsn = row.original;

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors shadow-none">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="font-sans space-y-1 rounded-xl shadow-lg border-slate-100 p-2 min-w-[160px]">
            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">Opsi</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors"
              onClick={() => navigate(`/master-npsn/${npsn.id}`)}>
              <Edit className="h-4 w-4 mr-2" /> Ubah Data
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2.5 font-medium transition-colors"
              onSelect={(e) => {
                e.preventDefault();
                onDeleteClick(npsn.id);
              }}>
              <Trash2 className="h-4 w-4 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];