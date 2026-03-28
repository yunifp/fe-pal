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
import type { INpsn } from "@/types/master";

export const getNpsnColumns = (
  onDeleteClick: (id: number) => void,
): ColumnDef<INpsn>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "npsn",
    header: "NPSN",
    cell: ({ row }) => row.original.npsn ?? "-",
  },
  {
    accessorKey: "sekolah",
    header: "Nama Sekolah",
  },
  {
    accessorKey: "jenis_sekolah",
    header: "Jenis Sekolah",
    cell: ({ row }) => row.original.jenis_sekolah ?? "-",
  },
  {
    accessorKey: "id_jenjang",
    header: "ID Jenjang",
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const npsn = row.original;
      const navigate = useNavigate();
      const canUpdate = useHasAccess("U");
      const canDelete = useHasAccess("D");

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
                  onClick={() => navigate(`/master-npsn/${npsn.id}`)}>
                  <Edit className="h-4 w-4 mr-1" /> Ubah
                </DropdownMenuItem>
              </>
            )}
            {canDelete && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  onDeleteClick(npsn.id);
                }}>
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
