import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Edit, MoreHorizontal } from "lucide-react";
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
import type { IJenjangSekolah } from "@/types/master";

// Terima callback onDeleteClick sebagai parameter
export const getColumns = (): ColumnDef<IJenjangSekolah>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "jenjang",
    header: "Nama",
  },
  {
    id: "aksi",
    cell: ({ row }) => {
      const jenjangSekolah = row.original;
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
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `/sekolah/jenjang-sekolah/${jenjangSekolah.id}/jurusan-sekolah`,
                )
              }
            >
              <BookOpen className="h-4 w-4 mr-1" /> Jurusan Sekolah
            </DropdownMenuItem>

            {canUpdate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/sekolah/jenjang-sekolah/${jenjangSekolah.id}`)
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
