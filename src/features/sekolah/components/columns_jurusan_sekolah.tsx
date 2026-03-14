import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHasAccess from "@/hooks/useHasAccess";
import type { IJurusanSekolah } from "@/types/master";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (): ColumnDef<IJurusanSekolah>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "jurusan",
    header: "Jurusan",
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const jurusanSekolah = row.original;
      const navigate = useNavigate();
      const canUpdate = useHasAccess("U");

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
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      `/sekolah/jenjang-sekolah/${jurusanSekolah.id_jurusan_sekolah}`,
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-1" /> Ubah
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
