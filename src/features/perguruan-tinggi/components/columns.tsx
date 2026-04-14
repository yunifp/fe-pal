/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, GraduationCap, ListChecks, MoreHorizontal, Trash2 } from "lucide-react";
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
import type { IPerguruanTinggi } from "@/types/master";

export const getColumns = (
  onDeleteClick: (id: number) => void
): ColumnDef<IPerguruanTinggi>[] => [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-slate-500">{row.index + 1}</span>,
    },
    {
      accessorKey: "nama_pt",
      header: "Nama Perguruan Tinggi",
      cell: ({ row }) => <span className="font-bold text-slate-900">{row.original.nama_pt}</span>
    },
    {
      header: "Singkatan",
      cell: ({ row }) => <span className="text-slate-600 font-medium">{row.original.singkatan ?? "-"}</span>,
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }) => {
        const perguruanTinggi = row.original;
        const navigate = useNavigate();
        const canUpdate = useHasAccess("U");
        const canDelete = useHasAccess("D");

        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors shadow-none">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-sans space-y-1 rounded-xl shadow-lg border-slate-100 p-2 min-w-[200px]">
              <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors"
                onClick={() =>
                  navigate(`/master/perguruan-tinggi/${perguruanTinggi.id_pt}/program-studi`)
                }
              >
                <GraduationCap className="h-4 w-4 mr-2" /> Program Studi
              </DropdownMenuItem>
              {canUpdate && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors"
                  onClick={() =>
                    navigate(
                      `/perguruan-tinggi/${perguruanTinggi.id_pt}/mapping-pendaftaran-beasiswa`,
                    )
                  }
                >
                  <ListChecks className="h-4 w-4 mr-2" /> Mapping Beasiswa
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg hover:bg-emerald-50 hover:text-emerald-700 py-2.5 font-medium transition-colors"
                    onClick={() =>
                      navigate(
                        `/master/perguruan-tinggi/${perguruanTinggi.id_pt}`,
                      )
                    }
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
                    onDeleteClick(perguruanTinggi.id_pt);
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