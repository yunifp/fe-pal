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
    { id: "no", header: "No", cell: ({ row }) => row.index + 1 },
    { accessorKey: "jenjang", header: "Jenjang" },
    { accessorKey: "nama_prodi", header: "Nama Prodi" },
    { accessorKey: "kuota", header: "Kuota" },
    { 
      accessorKey: "boleh_buta_warna", 
      header: "Boleh Buta Warna",
      cell: ({ row }) => row.original.boleh_buta_warna === "Y" ? "Ya" : "Tidak" 
    },
    {
      id: "aksi",
      cell: ({ row }) => {
        const prodi = row.original;
        const navigate = useNavigate();
        const canUpdate = useHasAccess("U");
        const canDelete = useHasAccess("D");
        const ptId = prodi.id_pt; 

        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-inter space-y-0.5">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
             {canUpdate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (isGlobalView) {
                      navigate(`/master/program-studi/${prodi.id_prodi}/edit`);
                    } else {
                      navigate(`/master/perguruan-tinggi/${ptId}/program-studi/${prodi.id_prodi}`);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Ubah
                </DropdownMenuItem>
              </>
            )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    onDeleteClick(prodi.id_prodi);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Hapus
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
      cell: ({ row }) => row.original.RefPerguruanTinggi?.nama_pt ?? "-",
    });
  }

  return baseColumns;
};