/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { IProgramStudi } from "@/types/programStudi";

export const getColumns = (
  isGlobalView: boolean,
  onDeleteClick: (id: number) => void
): ColumnDef<IProgramStudi>[] => {
  
  const baseColumns: ColumnDef<IProgramStudi>[] = [
    { 
      id: "no", 
      header: "No", 
      cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span>,
      size: 60,
    },
    { 
      accessorKey: "jenjang", 
      header: "Jenjang",
      cell: ({ row }) => <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">{row.original.jenjang}</span>
    },
    { 
      accessorKey: "nama_prodi", 
      header: "Nama Program Studi",
      cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_prodi}</span>
    },
    { 
      accessorKey: "kuota", 
      header: "Kuota",
      cell: ({ row }) => <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">{row.original.kuota}</span>
    },
    { 
      accessorKey: "boleh_buta_warna", 
      header: "Boleh Buta Warna",
      cell: ({ row }) => {
        const isBoleh = row.original.boleh_buta_warna === "Y";
        return (
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border ${
            isBoleh 
              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
              : "bg-rose-50 border-rose-100 text-rose-700"
          }`}>
            {isBoleh ? "Ya" : "Tidak"}
          </span>
        );
      }
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }) => {
        const prodi = row.original;
        const navigate = useNavigate();
        const canUpdate = useHasAccess("U");
        const canDelete = useHasAccess("D");
        const ptId = prodi.id_pt; 

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
              {canUpdate && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors"
                    onClick={() => {
                      if (isGlobalView) {
                        navigate(`/master/program-studi/${prodi.id_prodi}/edit`);
                      } else {
                        navigate(`/master/perguruan-tinggi/${ptId}/program-studi/${prodi.id_prodi}`);
                      }
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Ubah Data
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2.5 font-medium transition-colors"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDeleteClick(prodi.id_prodi);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isGlobalView) {
    baseColumns.splice(1, 0, {
      id: "nama_pt",
      header: "Perguruan Tinggi",
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.RefPerguruanTinggi?.nama_pt ?? "-"}</span>,
    });
  }

  return baseColumns;
};